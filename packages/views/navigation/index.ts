/**
 * [WHO]: Provides navigation context (NavigationProvider, useNavigation, useIsNavigating), link component (AppLink), and routing hooks (useAppOrigin, useRowLink)
 * [FROM]: Depends on context, app-link, use-app-origin, use-row-link, and types modules for cross-framework navigation abstraction and adapter-based routing
 * [TO]: Consumed by apps/web/platform/navigation.tsx, apps/desktop/src/renderer/src/platform/navigation.tsx, and 100+ files across packages/views for page routing, link generation, and navigation state management
 * [HERE]: packages/views/navigation/index.ts - Public API surface for navigation abstraction; re-exports provider, hooks, link component, and adapter types to decouple views from framework-specific routing
 */

export {
  NavigationProvider,
  useNavigation,
  useIsNavigating,
} from "./context";
export { AppLink } from "./app-link";
export { useAppOrigin } from "./use-app-origin";
export { useRowLink } from "./use-row-link";
export type { NavigationAdapter } from "./types";
