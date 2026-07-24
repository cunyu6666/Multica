/**
 * [WHO]: React-only i18n entry point (depends on react-i18next)
 * [FROM]: Depends on ./create-i18n, ./provider, ./adapter-context, ./user-locale-sync
 * [TO]: Consumed by client-side app bootstrap and i18n provider trees
 * [HERE]: packages/core/i18n/react.ts - React i18n entry (client-only)
 */
// React-only i18n entry: depends on react-i18next, which calls
// React.createContext() at module load. Importing this from a non-client
// context (RSC / proxy.ts) will crash with "createContext is not a function"
// because Next.js vendors a stripped React build for those contexts.
// Always pair with "use client" or import only inside client trees.
export { createI18n } from "./create-i18n";
export { I18nProvider, type I18nProviderProps } from "./provider";
export { LocaleAdapterProvider, useLocaleAdapter } from "./adapter-context";
export { UserLocaleSync } from "./user-locale-sync";
