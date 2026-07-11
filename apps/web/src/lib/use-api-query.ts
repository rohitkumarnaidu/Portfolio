import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query';

export function useApiQuery<TData>(
  queryKey: QueryKey,
  fetcher: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, Error, TData, QueryKey>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData, Error, TData, QueryKey>({
    queryKey,
    queryFn: fetcher,
    ...options,
  });
}
