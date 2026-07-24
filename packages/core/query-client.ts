/**
 * [WHO]: Provides createQueryClient - a factory that produces a TanStack QueryClient with project-wide defaults (infinite staleTime, 10min GC, no auto-refetch)
 * [FROM]: Depends on @tanstack/react-query for the QueryClient class
 * [TO]: Consumed by packages/core/provider.tsx (wraps it in useState for React) and re-exported via packages/core/index.ts
 * [HERE]: packages/core/query-client.ts - pure factory function; sibling provider.tsx supplies the React component boundary, this file is framework-agnostic config
 */

import { QueryClient } from "@tanstack/react-query";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: 1,
      },
      mutations: {
        retry: false,
      },
    },
  });
}
