/**
 * [WHO]: Re-exports modal store for app-wide modal management
 * [FROM]: Depends on ./store
 * [TO]: Consumed by views that open/create/close modals
 * [HERE]: packages/core/modals/index.ts - barrel export for modal state
 */
export { useModalStore } from "./store";
