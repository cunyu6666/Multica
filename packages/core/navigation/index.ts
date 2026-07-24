/**
 * [WHO]: Re-exports navigation store for cross-workspace tab navigation
 * [FROM]: Depends on ./store
 * [TO]: Consumed by platform adapters and navigation providers
 * [HERE]: packages/core/navigation/index.ts - barrel export for navigation state
 */
export { useNavigationStore } from "./store";
