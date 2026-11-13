import type { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RAW_RESPONSE_KEY } from '../decorators/raw.decorator';

export interface ApiEnvelope<T> {
  data: T;
  meta?: Record<string, unknown>;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
  );
}

function isAlreadyEnveloped(value: unknown): value is ApiEnvelope<unknown> {
  if (!isPlainObject(value) || !('data' in value)) return false;
  return Object.keys(value).every((key) => key === 'data' || key === 'meta');
}

const SNAKE_ALIAS_SKIP = new Set(['__proto__', 'constructor', 'prototype']);

/**
 * Adds a snake_case mirror for every camelCase key so the API satisfies both
 * the `packages/shared` snake_case contract and the newer camelCase admin pages.
 * Prisma returns camelCase; the public site's shared types are snake_case.
 */
function addSnakeCaseAliases(value: unknown, seen = new WeakSet<object>()): void {
  if (value === null || typeof value !== 'object') return;
  if (value instanceof Date || Buffer.isBuffer(value)) return;
  if (seen.has(value)) return;
  seen.add(value);

  if (Array.isArray(value)) {
    for (const item of value) addSnakeCaseAliases(item, seen);
    return;
  }

  if (!isPlainObject(value)) return;

  for (const key of Object.keys(value)) {
    if (SNAKE_ALIAS_SKIP.has(key)) continue;
    const child = value[key];
    addSnakeCaseAliases(child, seen);

    const alias = key.replace(/[A-Z]/g, (char) => `_${char.toLowerCase()}`);
    if (alias !== key && !(alias in value)) {
      value[alias] = child;
    }
  }
}

/**
 * Wraps every successful handler result in the `{ data, meta? }` envelope.
 * Paginated results from `paginate()` already have that shape and pass
 * through untouched. Routes that stream files, redirect, or use `@Res()`
 * opt out with `@Raw()`.
 */
@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isRaw = this.reflector.getAllAndOverride<boolean>(RAW_RESPONSE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isRaw) return next.handle();

    return next.handle().pipe(
      map((payload: unknown) => {
        if (payload === undefined || payload === null) return payload;

        const body = isAlreadyEnveloped(payload) ? payload : { data: payload };
        addSnakeCaseAliases(body);
        return body;
      }),
    );
  }
}
