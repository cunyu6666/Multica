/**
 * [WHO]: Defines i18n types (SupportedLocale, LocaleAdapter, LocaleResources) and constants
 * [FROM]: No dependencies
 * [TO]: Consumed by all i18n module files and locale adapters
 * [HERE]: packages/core/i18n/types.ts - i18n type definitions and locale constants
 */
export type SupportedLocale = "en" | "zh-Hans" | "ko" | "ja";

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "zh-Hans", "ko", "ja"];
export const DEFAULT_LOCALE: SupportedLocale = "en";

export type LocaleResources = Record<string, Record<string, unknown>>;

export interface LocaleAdapter {
  getUserChoice(): string | null;
  getSystemPreferences(): string[];
  persist(locale: SupportedLocale): void;
}
