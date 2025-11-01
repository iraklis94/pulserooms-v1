import { useEffect, useState } from 'react';
import { useQuery } from 'convex/react';
import { FunctionReference } from 'convex/server';

interface PaginatedQueryOptions {
  pageSize?: number;
  enabled?: boolean;
}

export function usePaginatedQuery<T>(
  query: FunctionReference<'query', 'public', any, T[]>,
  args: any,
  options: PaginatedQueryOptions = {}
) {
  const { pageSize = 20, enabled = true } = options;
  const [page, setPage] = useState(0);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Fetch current page
  const data = useQuery(
    query as any,
    enabled ? { ...args, limit: pageSize, offset: page * pageSize } : 'skip'
  );

  useEffect(() => {
    if (data) {
      if (page === 0) {
        setAllData(data);
      } else {
        setAllData((prev) => [...prev, ...data]);
      }

      setHasMore(data.length === pageSize);
    }
  }, [data, page, pageSize]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const refresh = () => {
    setPage(0);
    setAllData([]);
    setHasMore(true);
  };

  const loading = data === undefined;

  return {
    data: allData,
    loading,
    hasMore,
    loadMore,
    refresh,
  };
}

