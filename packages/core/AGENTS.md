# packages/core/

> P2 | Parent: ../../AGENTS.md

## Member List

index.ts: Barrel exports for core module, re-exports useWorkspaceId, createQueryClient, and QueryProvider
logger.ts: Provides createLogger(namespace) factory returning a typed Logger interface with debug/info/warn/error methods, color-coded console output, and ISO timestamp prefix
query-client.ts: Exports createQueryClient() factory configuring TanStack Query with staleTime: Infinity, gcTime: 10 min, refetchOnWindowFocus: false, retry: 1 for queries and retry: false for mutations
utils.ts: Provides generateUUID() (RFC 4122 v4 via crypto.getRandomValues), createSafeId() (prefers crypto.randomUUID with fallback), createRequestId(length?: number) (truncated UUID prefix), and isImeComposing() (navigator check for IME state)
utils.test.ts: Unit tests for utils id helpers (generateUUID, createSafeId, createRequestId) and isImeComposing using Vitest with mocked crypto globals
vitest.config.ts: Vitest configuration enabling globals, including **/*.test.{ts,tsx}, and passWithNoTests: true
hooks.tsx: Exports useWorkspaceId() hook ("use client") that derives workspace UUID from useCurrentWorkspace(), throws if called outside a workspace route
provider.tsx: Exports QueryProvider React component ("use client") wrapping children in TanStack Query's QueryClientProvider with a singleton queryClient via useState(createQueryClient)
