import type { NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  isSandboxAuthorized,
  unauthorizedResponse,
  resolveSandboxPath,
  sandboxEnvHint,
} from '../_lib';

// Next.js statically analyses segment config, so this must be a literal.
export const runtime = 'nodejs';

const execFileAsync = promisify(execFile);

interface CommitBody {
  path?: string;
  content?: string;
  message?: string;
  branch?: string;
  owner?: string;
  repo?: string;
  token?: string;
}

// Only allow refs/branch names that are safe for direct argument passing.
const SAFE_REF = /^[A-Za-z0-9._/-]+$/;

export async function POST(request: NextRequest) {
  if (!isSandboxAuthorized(request.headers.get('authorization'))) {
    return unauthorizedResponse();
  }

  const hint = sandboxEnvHint();
  if (hint) {
    return Response.json({ error: hint }, { status: 500 });
  }

  let body: CommitBody;
  try {
    body = (await request.json()) as CommitBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { path: filePath, content, message, branch, owner, repo, token } = body;

  if (!filePath || typeof filePath !== 'string') {
    return Response.json({ error: 'path is required' }, { status: 400 });
  }
  if (typeof content !== 'string') {
    return Response.json({ error: 'content is required' }, { status: 400 });
  }
  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'message is required' }, { status: 400 });
  }

  const resolved = resolveSandboxPath(filePath);
  if (!resolved) {
    return Response.json({ error: 'Invalid or disallowed path' }, { status: 400 });
  }

  const workdir = path.dirname(resolved);

  // Write the file. Create parent directories as needed.
  try {
    await fs.mkdir(path.dirname(resolved), { recursive: true });
    await fs.writeFile(resolved, content, 'utf8');
  } catch {
    return Response.json({ error: 'Failed to write file' }, { status: 500 });
  }

  try {
    // Optional remote push via HTTPS using a token. Inputs are passed as
    // execFile arguments (never interpolated into a shell string).
    if (owner && repo && token && branch && SAFE_REF.test(branch)) {
      const remoteUrl = `https://${encodeURIComponent(token)}@github.com/${owner}/${repo}.git`;
      await execFileAsync('git', ['-C', workdir, 'remote', 'set-url', 'origin', remoteUrl], {
        timeout: 15000,
      }).catch(() =>
        execFileAsync('git', ['-C', workdir, 'remote', 'add', 'origin', remoteUrl], {
          timeout: 15000,
        }),
      );
    }

    await execFileAsync('git', ['-C', workdir, 'add', resolved], { timeout: 15000 });
    await execFileAsync('git', ['-C', workdir, 'commit', '-m', message], { timeout: 15000 });

    if (branch && SAFE_REF.test(branch)) {
      await execFileAsync('git', ['-C', workdir, 'push', 'origin', branch], { timeout: 30000 });
    }

    let sha: string | undefined;
    try {
      const out = await execFileAsync('git', ['-C', workdir, 'rev-parse', 'HEAD'], {
        timeout: 10000,
      });
      sha = out.stdout.trim() || undefined;
    } catch {
      // Non-fatal: commit succeeded even if we couldn't read the sha.
    }

    return Response.json({ data: { ok: true, sha } });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : 'git operation failed';
    return Response.json({ error: `Commit failed: ${messageText}` }, { status: 500 });
  }
}
