/**
 * [WHO]: Creates i18next instances configured for a locale and resources
 * [FROM]: Depends on i18next, react-i18next, ./types
 * [TO]: Consumed by React i18n entry point and server-side i18n initialization
 * [HERE]: packages/core/i18n/create-i18n.ts - i18next instance factory
 */
import i18next, { type i18n as I18n } from "i18next";
import { initReactI18next } from "react-i18next";
import type { LocaleResources, SupportedLocale } from "./types";

// Both server (RSC) and client must call this with the SAME locale + resources
// to avoid hydration mismatch. `initAsync: false` forces synchronous init
// (renamed from `initImmediate` in i18next v25+); `useSuspense: false`
// prevents fallback rendering during hydration.
export function createI18n(
  locale: SupportedLocale,
  resources: Record<string, LocaleResources>,
): I18n {
  const instance = i18next.createInstance();
  instance.use(initReactI18next).init({
    lng: locale,
    fallbackLng: "en",
    resources,
    interpolation: { escapeValue: false },
    initAsync: false,
    react: { useSuspense: false },
  });
  return instance;
}
