/**
 * [WHO]: Provides a portable storage adapter interface
 * [FROM]: No internal dependencies
 * [TO]: Consumed by core/i18n/, onboarding/, any code needing durable key-value storage
 * [HERE]: packages/core/types/storage.ts - StorageAdapter interface for cross-environment persistence
 */

export interface StorageAdapter {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
