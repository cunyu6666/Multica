/**
 * [WHO]: Provides createPersistStorage — a bridge between Zustand's persist
 *         middleware and the StorageAdapter DI system for non-workspace-scoped
 *         stores.
 * [FROM]: Depends on zustand/middleware (StateStorage), types/storage
 *         (StorageAdapter interface).
 * [TO]: Consumed by Zustand stores that need persist configuration without
 *       workspace scoping. For workspace-scoped stores, use
 *       createWorkspaceAwareStorage instead.
 * [HERE]: packages/core/platform/persist-storage.ts - Zustand persist storage
 *         adapter factory delegating to the injected StorageAdapter.
 */
import type { StateStorage } from "zustand/middleware";
import type { StorageAdapter } from "../types/storage";

/**
 * Bridge between Zustand persist middleware and our StorageAdapter DI system.
 * For workspace-scoped stores, use createWorkspaceAwareStorage instead.
 */
export function createPersistStorage(adapter: StorageAdapter): StateStorage {
  return {
    getItem: (key) => adapter.getItem(key),
    setItem: (key, value) => adapter.setItem(key, value),
    removeItem: (key) => adapter.removeItem(key),
  };
}
