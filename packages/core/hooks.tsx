"use client";
/**
 * [WHO]: Provides useWorkspaceId - a hook that returns the current workspace UUID or throws if outside a workspace route
 * [FROM]: Depends on ./paths/hooks for useCurrentWorkspace (URL slug + React Query list resolution)
 * [TO]: Consumed by packages/views/layout/workspace-presence-prefetch.tsx, packages/views/search/search-command.tsx, packages/views/members/member-profile-card.tsx, and re-exported via packages/core/index.ts
 * [HERE]: packages/core/hooks.tsx - single-purpose hook deriving workspace ID from the paths layer; no longer backed by React Context (WorkspaceIdProvider removed in slug-first refactor)
 */

import { useCurrentWorkspace } from "./paths/hooks";

/**
 * Returns the current workspace UUID. Throws if called outside a workspace route.
 *
 * Implementation: derives from useCurrentWorkspace() (URL slug + React Query list).
 * No longer backed by a React Context — the WorkspaceIdProvider has been removed
 * as part of the slug-first refactor. The throw semantics are preserved so existing
 * callers that depend on non-null don't need guard code.
 */
export function useWorkspaceId(): string {
  const ws = useCurrentWorkspace();
  if (!ws) throw new Error("useWorkspaceId: no workspace selected — ensure component renders inside a workspace route");
  return ws.id;
}
