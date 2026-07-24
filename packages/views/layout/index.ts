/**
 * [WHO]: Provides layout components (AppSidebar, DashboardLayout, DashboardGuard, CollectionPageHeader, GlobalShortcuts, WorkspaceLoader) and tab presentation utilities
 * [FROM]: Depends on internal layout modules (app-sidebar, collection-page, route-icon-components, tab-presentation, dashboard-guard, dashboard-layout, use-dashboard-guard, workspace-loader, workspace-presence-prefetch, global-shortcuts) for sidebar rendering, dashboard protection, route icons, and workspace state
 * [TO]: Consumed by apps/web/app/[workspaceSlug]/(dashboard)/layout.tsx, apps/desktop/src/renderer/src/components/workspace-route-layout.tsx, apps/desktop/src/renderer/src/components/tab-bar.tsx, apps/desktop/src/renderer/src/components/issue-window.tsx, apps/desktop/src/renderer/src/components/desktop-layout.tsx for workspace-level layout structure
 * [HERE]: packages/views/layout/index.ts - Public API surface for layout components; re-exports sidebar, dashboard guard, collection page header, route icons, tab presentation, workspace loader, and global shortcuts
 */

export { AppSidebar } from "./app-sidebar";
export {
  CollectionPageHeader,
  CollectionPageHeaderAction,
  CollectionPageState,
} from "./collection-page";
export { ROUTE_ICON_COMPONENTS, routeIconForPath } from "./route-icon-components";
export {
  useTabPresentation,
  ResourceLeadingVisual,
} from "./tab-presentation";
export type { TabPresentationResult } from "./tab-presentation";
export { DashboardGuard } from "./dashboard-guard";
export { DashboardLayout } from "./dashboard-layout";
export { useDashboardGuard } from "./use-dashboard-guard";
export { WorkspaceLoader } from "./workspace-loader";
export { WorkspacePresencePrefetch } from "./workspace-presence-prefetch";
export { GlobalShortcuts } from "./global-shortcuts";
