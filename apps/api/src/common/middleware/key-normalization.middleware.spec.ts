import { KeyNormalizationMiddleware } from './key-normalization.middleware';

describe('KeyNormalizationMiddleware', () => {
  const res = {} as never;

  it('camelizes snake_case body keys and leaves nested objects alone', () => {
    const req = {
      body: { first_name: 'Ada', display_name: 'Ada L', nested: { keep_me: 1 } },
    } as any;
    const next = jest.fn();

    KeyNormalizationMiddleware(req, res, next);

    expect(req.body).toEqual({
      firstName: 'Ada',
      displayName: 'Ada L',
      nested: { keep_me: 1 },
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('camelizes snake_case query keys', () => {
    const req = { query: { page_size: '10', sort_order: 'asc' } } as any;
    const next = jest.fn();

    KeyNormalizationMiddleware(req, res, next);

    expect(req.query).toEqual({ pageSize: '10', sortOrder: 'asc' });
  });

  it('keeps the normalized query when the request exposes it as a getter', () => {
    // Express 5 defines req.query as a getter that re-parses the query string
    // on every access, so a mutated copy would be discarded. The middleware
    // has to replace it on the request instance.
    const req = {} as any;
    Object.defineProperty(req, 'query', {
      configurable: true,
      get: () => ({ page_size: '10' }),
    });
    const next = jest.fn();

    KeyNormalizationMiddleware(req, res, next);

    expect(req.query).toEqual({ pageSize: '10' });
  });

  it('leaves requests without a body or query untouched', () => {
    const req = {} as any;
    const next = jest.fn();

    KeyNormalizationMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
