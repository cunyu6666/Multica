/**
 * [WHO]: Provides the defaultStorage adapter — an SSR-safe localStorage
 *         implementation that works in both Next.js (SSR) and Electron.
 * [FROM]: Depends on types/storage (StorageAdapter interface).
 * [TO]: Consumed by CoreProvider, AuthInitializer, createPersistStorage,
 *       createWorkspaceAwareStorage, and any store that needs durable storage.
 * [HERE]: packages/core/platform/storage.ts - Default SSR-safe localStorage
 *         wrapper used as the fallback StorageAdapter across the platform.
 */
import type { StorageAdapter } from "../types/storage";

/** SSR-safe localStorage. Works in both Next.js (SSR) and Electron (always client). */
export const defaultStorage: StorageAdapter = {
  getItem: (k) =>
    typeof window !== "undefined" ? localStorage.getItem(k) : null,
  setItem: (k, v) => {
    if (typeof window !== "undefined") localStorage.setItem(k, v);
  },
  removeItem: (k) => {
    if (typeof window !== "undefined") localStorage.removeItem(k);
  },
};
