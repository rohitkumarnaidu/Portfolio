import type { NextRequest } from 'next/server';
import fs from 'node:fs/promises';
import {
  isSandboxAuthorized,
  unauthorizedResponse,
  resolveSandboxPath,
  sandboxEnvHint,
} from '../_lib';

// Next.js statically analyses segment config, so this must be a literal.
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  if (!isSandboxAuthorized(request.headers.get('authorization'))) {
    return unauthorizedResponse();
  }

  const hint = sandboxEnvHint();
  if (hint) {
    return Response.json({ error: hint }, { status: 500 });
  }

  const requested = request.nextUrl.searchParams.get('path');
  const resolved = resolveSandboxPath(requested);

  if (!resolved) {
    return Response.json({ error: 'Invalid or disallowed path' }, { status: 400 });
  }

  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    stat = await fs.stat(resolved);
  } catch {
    return Response.json({ error: 'File not found' }, { status: 404 });
  }

  if (!stat.isFile()) {
    return Response.json({ error: 'Not a file' }, { status: 400 });
  }

  let content: string;
  try {
    content = await fs.readFile(resolved, 'utf8');
  } catch {
    return Response.json({ error: 'Unable to read file' }, { status: 500 });
  }

  return Response.json({ data: { content } });
}
