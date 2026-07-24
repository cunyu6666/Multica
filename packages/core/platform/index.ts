/**
 * [WHO]: Re-exports platform abstraction (provider, storage, notifications, auth initializer)
 * [FROM]: Depends on ./core-provider, ./types, ./auth-initializer, ./storage, ./persist-storage, ./workspace-storage, ./storage-cleanup, ./system-notification
 * [TO]: Consumed by app/platform layers (web Next.js, desktop Electron) to bootstrap the core
 * [HERE]: packages/core/platform/index.ts - barrel export for platform primitives
 */
export { CoreProvider } from "./core-provider";
export type { CoreProviderProps, ClientIdentity } from "./types";
export { AuthInitializer } from "./auth-initializer";
export { defaultStorage } from "./storage";
export { createPersistStorage } from "./persist-storage";
export { createWorkspaceAwareStorage, setCurrentWorkspace, getCurrentSlug, getCurrentWsId, subscribeToCurrentSlug, registerForWorkspaceRehydration } from "./workspace-storage";
export { clearWorkspaceStorage } from "./storage-cleanup";
export {
  registerSystemNotificationClickHandler,
  isWebNotificationSupported,
  getWebNotificationPermission,
  requestWebNotificationPermission,
  showWebNotification,
  type SystemNotificationPayload,
  type WebNotificationPermission,
} from "./system-notification";
