import type { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of, lastValueFrom } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let reflector: { getAllAndOverride: jest.Mock };
  let interceptor: TransformInterceptor;

  const handlerReturning = (payload: unknown): CallHandler => ({ handle: () => of(payload) });

  const context = {
    getHandler: () => function handler() {},
    getClass: () => class Controller {},
  } as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    interceptor = new TransformInterceptor(reflector as unknown as Reflector);
  });

  it('wraps a plain payload in the data envelope', async () => {
    const result = await lastValueFrom(interceptor.intercept(context, handlerReturning({ id: 1 })));

    expect(result).toEqual({ data: { id: 1 } });
  });

  it('returns null and undefined payloads untouched', async () => {
    await expect(
      lastValueFrom(interceptor.intercept(context, handlerReturning(null))),
    ).resolves.toBeNull();
    await expect(
      lastValueFrom(interceptor.intercept(context, handlerReturning(undefined))),
    ).resolves.toBeUndefined();
  });

  it('keeps an already enveloped payload', async () => {
    const result = await lastValueFrom(
      interceptor.intercept(context, handlerReturning({ data: { id: 1 } })),
    );

    expect(result).toEqual({ data: { id: 1 } });
  });

  it('skips the envelope for raw routes', async () => {
    reflector.getAllAndOverride.mockReturnValue(true);

    const result = await lastValueFrom(
      interceptor.intercept(context, handlerReturning('raw body')),
    );

    expect(result).toBe('raw body');
  });

  it('adds snake_case aliases for camelCase keys', async () => {
    const result = (await lastValueFrom(
      interceptor.intercept(context, handlerReturning({ displayOrder: 2, techStack: ['a'] })),
    )) as { data: Record<string, unknown> };

    expect(result.data.display_order).toBe(2);
    expect(result.data.tech_stack).toEqual(['a']);
  });

  it('adds aliases to nested objects and arrays', async () => {
    const result = (await lastValueFrom(
      interceptor.intercept(
        context,
        handlerReturning({ items: [{ innerValue: 1 }], nested: { deepValue: 2 } }),
      ),
    )) as { data: Record<string, any> };

    expect(result.data.items[0].inner_value).toBe(1);
    expect(result.data.nested.deep_value).toBe(2);
  });

  it('leaves dates and buffers alone', async () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const result = (await lastValueFrom(
      interceptor.intercept(context, handlerReturning({ createdAt: date, raw: Buffer.from('x') })),
    )) as { data: Record<string, unknown> };

    expect(result.data.createdAt).toBe(date);
    expect(result.data.created_at).toBe(date);
    expect(Buffer.isBuffer(result.data.raw)).toBe(true);
  });

  it('does not alias prototype polluting keys', async () => {
    const result = (await lastValueFrom(
      interceptor.intercept(context, handlerReturning({ safeValue: 1 })),
    )) as { data: Record<string, unknown> };

    expect(result.data.safe_value).toBe(1);
    expect(Object.prototype.hasOwnProperty.call(result.data, '__proto__')).toBe(false);
  });

  it('does not overwrite an existing snake_case key', async () => {
    const result = (await lastValueFrom(
      interceptor.intercept(context, handlerReturning({ displayOrder: 2, display_order: 9 })),
    )) as { data: Record<string, unknown> };

    expect(result.data.display_order).toBe(9);
  });

  it('survives circular references', async () => {
    const payload: Record<string, unknown> = { name: 'loop' };
    payload.self = payload;

    const result = await lastValueFrom(interceptor.intercept(context, handlerReturning(payload)));

    expect((result as { data: Record<string, unknown> }).data.name).toBe('loop');
  });
});
