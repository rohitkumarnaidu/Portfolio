import type { NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import type { Dirent } from 'node:fs';
import {
  isSandboxAuthorized,
  unauthorizedResponse,
  resolveSandboxPath,
  sandboxEnvHint,
  SANDBOX_RUNTIME,
} from '../_lib';

export const runtime = SANDBOX_RUNTIME;

export async function GET(request: NextRequest) {
  if (!isSandboxAuthorized(request.headers.get('authorization'))) {
    return unauthorizedResponse();
  }

  const hint = sandboxEnvHint();
  if (hint) {
    return Response.json({ error: hint }, { status: 500 });
  }

  const requested = request.nextUrl.searchParams.get('path');
  const resolved = resolveSandboxPath(requested || '');

  if (!resolved) {
    return Response.json({ error: 'Invalid or disallowed path' }, { status: 400 });
  }

  let entries: Dirent[];
  try {
    entries = await fs.readdir(resolved, { withFileTypes: true });
  } catch {
    return Response.json({ error: 'Unable to read directory' }, { status: 500 });
  }

  const files = entries
    .filter((entry) => !entry.name.startsWith('.'))
    .map((entry) => {
      const entryPath = path.join(requested || '', entry.name);
      // Stable, non-sensitive id derived from the relative path.
      const sha = crypto.createHash('sha1').update(entryPath).digest('hex').slice(0, 16);
      return {
        name: entry.name,
        path: entryPath,
        type: entry.isDirectory() ? ('dir' as const) : ('file' as const),
        sha,
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return Response.json({ data: files });
}
