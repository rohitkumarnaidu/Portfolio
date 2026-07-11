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
    per_page: number;
    total: number;
    total_pages: number;
    has_next_page: boolean;
    has_previous_page: boolean;
  };
}

export function paginate<T>(
  items: T[],
  opts: PaginationOpts = {},
): PaginatedResult<T> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 20));
  const total = items.length;
  const start = (page - 1) * perPage;
  const data = items.slice(start, start + perPage);

  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
      has_next_page: start + perPage < total,
      has_previous_page: page > 1,
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

export async function paginateQuery<T>(
  prismaQuery: (args: { skip: number; take: number; orderBy?: any }) => Promise<T[]>,
  countQuery: () => Promise<number>,
  opts: PaginationOpts = {},
): Promise<PaginatedResult<T>> {
  const page = Math.max(1, opts.page ?? 1);
  const perPage = Math.min(100, Math.max(1, opts.perPage ?? 20));
  const skip = (page - 1) * perPage;
  const take = perPage;

  const [data, total] = await Promise.all([
    prismaQuery({ skip, take }),
    countQuery(),
  ]);

  return {
    data,
    meta: {
      page,
      per_page: perPage,
      total,
      total_pages: Math.ceil(total / perPage),
      has_next_page: skip + perPage < total,
      has_previous_page: page > 1,
    },
  };
}
