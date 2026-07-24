/**
 * [WHO]: Provides workspace storage cleanup utilities — removes all
 *         workspace-scoped persist keys when a workspace is deleted or the
 *         user logs out.
 * [FROM]: Depends on types/storage (StorageAdapter interface).
 * [TO]: Consumed by workspace delete/logout flows in apps/web and apps/desktop
 *       to purge durable storage for a removed workspace slug.
 * [HERE]: packages/core/platform/storage-cleanup.ts - Workspace-scoped storage
 *         key registry and bulk removal utility.
 */
import type { StorageAdapter } from "../types/storage";

/**
 * Keys that are namespaced per workspace (stored as `${key}:${slug}`).
 *
 * IMPORTANT: When adding a new workspace-scoped persist store or storage key,
 * add its key here so that workspace deletion and logout properly clean it up.
 * Also ensure the store uses `createWorkspaceAwareStorage` for its persist config.
 */
const WORKSPACE_SCOPED_KEYS = [
  "multica_issue_draft",
  "multica_issue_surface_views",
  "multica_issues_view",
  "multica_issues_scope",
  "multica_my_issues_view",
  "multica:chat:selectedAgentId",
  "multica:chat:activeSessionId",
  "multica:chat:drafts",
  "multica:chat:expanded",
  "multica_navigation",
];

/** Remove all workspace-scoped storage entries for the given workspace slug. */
export function clearWorkspaceStorage(
  adapter: StorageAdapter,
  slug: string,
) {
  for (const key of WORKSPACE_SCOPED_KEYS) {
    adapter.removeItem(`${key}:${slug}`);
  }
}
