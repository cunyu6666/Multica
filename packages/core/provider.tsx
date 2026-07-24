"use client";
/**
 * [WHO]: Provides QueryProvider - a React component that wraps children in TanStack Query's QueryClientProvider with a stable client
 * [FROM]: Depends on @tanstack/react-query for QueryClientProvider and ./query-client for createQueryClient
 * [TO]: Consumed by packages/core/platform/core-provider.tsx and re-exported via packages/core/index.ts
 * [HERE]: packages/core/provider.tsx - thin provider that owns a single QueryClient instance via useState; sibling query-client.ts defines the client configuration, this file provides the React boundary
 */

import { useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "./query-client";
import type { ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
