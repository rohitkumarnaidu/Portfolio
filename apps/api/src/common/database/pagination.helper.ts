export interface PaginationOpts {
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function paginate<T>(items: T[], opts: PaginationOpts = {}): PaginatedResult<T> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 20));
  const total = items.length;
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);

  return {
    data,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: start + perPage < total,
      hasPreviousPage: page > 1,
    },
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export interface DbPaginationOpts extends PaginationOpts {
  skip?: number;
  take?: number;
}

export type OrderByInput = Record<string, 'asc' | 'desc'>;

export async function paginateQuery<T>(
  prismaQuery: (args: {
    skip: number;
    take: number;
    orderBy?: OrderByInput | OrderByInput[];
  }) => Promise<T[]>,
  countQuery: () => Promise<number>,
  opts: PaginationOpts = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 20));
  const skip = (page - 1) * perPage;
  const take = perPage;

  const [data, total] = await Promise.all([prismaQuery({ skip, take }), countQuery()]);

  return {
    data,
    meta: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
      hasNextPage: skip + perPage < total,
      hasPreviousPage: page > 1,
    },
  };
}
