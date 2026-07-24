/**
 * [WHO]: Provides the dashboard page component (DashboardPage)
 * [FROM]: Depends on dashboard-page component for rendering the workspace dashboard with key metrics and activity
 * [TO]: Consumed by apps/web/app/[workspaceSlug]/(dashboard)/usage/page.tsx, apps/desktop/src/renderer/src/routes.tsx for workspace-level dashboard routing
 * [HERE]: packages/views/dashboard/index.ts - Public API surface for dashboard views; re-exports dashboard page component
 */

export { DashboardPage } from "./components/dashboard-page";
