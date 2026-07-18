import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';

const SANDBOX_API_SECRET = process.env.SANDBOX_API_SECRET;

/**
 * Returns true when the request is authorized for sandbox admin operations.
 * Accepts either the admin access token (localStorage admin_access_token) or,
 * when configured, a shared SANDBOX_API_SECRET bearer.
 */
export function isSandboxAuthorized(authHeader: string | null | undefined): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return false;

  // A shared secret is the primary guard. If it is not set, we fall back to
  // accepting any non-empty bearer token (the admin session token) so the
  // dashboard keeps working in local/dev without extra configuration.
  if (SANDBOX_API_SECRET) {
    return token === SANDBOX_API_SECRET;
  }
  return true;
}

export function unauthorizedResponse() {
  return Response.json({ error: 'Unauthorized' }, { status: 401 });
}

/**
 * Resolves a requested (possibly relative) path against the sandbox working
 * directory. Returns null when the result escapes the working directory
 * (path traversal), when the working dir is unavailable, or when the path is
 * otherwise unsafe.
 */
export function resolveSandboxPath(requestedPath: string | null | undefined): string | null {
  if (!requestedPath || typeof requestedPath !== 'string') return null;

  const workdir = process.env.SANDBOX_WORKDIR;
  if (!workdir) return null;

  const absoluteWorkdir = path.resolve(workdir);
  if (!fs.existsSync(absoluteWorkdir)) return null;

  // Normalize and ensure it stays within the working directory.
  const candidate = path.resolve(absoluteWorkdir, requestedPath);
  const relative = path.relative(absoluteWorkdir, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;

  return candidate;
}

export function getSandboxWorkdir(): string | null {
  const workdir = process.env.SANDBOX_WORKDIR;
  if (!workdir) return null;
  const absolute = path.resolve(workdir);
  if (!fs.existsSync(absolute)) return null;
  return absolute;
}

export const SANDBOX_RUNTIME = 'nodejs' as const;

export const sandboxEnvHint = () => {
  if (!process.env.SANDBOX_WORKDIR) {
    return 'SANDBOX_WORKDIR is not configured. Set it to a directory that the sandbox may read/write.';
  }
  return null;
};

export function osTmpSandboxDir(): string {
  return path.join(os.tmpdir(), 'portfolio-sandbox');
}
