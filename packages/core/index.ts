/**
 * [WHO]: Provides the public API surface of @multica/core (useWorkspaceId, createQueryClient, QueryProvider)
 * [FROM]: Depends on ./hooks, ./query-client, ./provider for re-exports
 * [TO]: Consumed by packages/views/layout/workspace-presence-prefetch.tsx, packages/views/search/search-command.tsx, packages/views/members/member-profile-card.tsx, packages/core/platform/core-provider.tsx
 * [HERE]: packages/core/index.ts - barrel file that re-exports core primitives; siblings (provider.tsx, hooks.tsx, query-client.ts) implement, this file aggregates for external consumers
 */

export { useWorkspaceId } from "./hooks";
export { createQueryClient } from "./query-client";
export { QueryProvider } from "./provider";
