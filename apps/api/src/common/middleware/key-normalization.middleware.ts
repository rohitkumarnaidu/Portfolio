import type { NextFunction, Request, Response } from 'express';

function camelizeShallow(target: Record<string, unknown>): void {
  for (const key of Object.keys(target)) {
    if (!key.includes('_')) continue;
    const camelKey = key.replace(/_([a-z0-9])/g, (_match, char: string) => char.toUpperCase());
    if (camelKey !== key && !(camelKey in target)) {
      target[camelKey] = target[key];
    }
    delete target[key];
  }
}

/**
 * Accepts both snake_case (the historical web contract) and camelCase
 * (the NestJS DTO contract) request bodies and query parameters.
 *
 * Only top-level keys are normalized. Nested JSON blobs such as `content`
 * and `metrics` are stored verbatim because their keys are user data.
 */
export function KeyNormalizationMiddleware(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object' && !Array.isArray(req.body)) {
    camelizeShallow(req.body as Record<string, unknown>);
  }
  if (req.query && typeof req.query === 'object') {
    camelizeShallow(req.query as Record<string, unknown>);
  }
  next();
}
