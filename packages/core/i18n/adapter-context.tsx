/**
 * [WHO]: Provides React context and hooks for locale adapter injection
 * [FROM]: Depends on react, ./types
 * [TO]: Consumed by platform i18n provider and locale-aware components
 * [HERE]: packages/core/i18n/adapter-context.tsx - locale adapter React context
 */
"use client";

import { createContext, use, type ReactNode } from "react";
import type { LocaleAdapter } from "./types";

const LocaleAdapterContext = createContext<LocaleAdapter | null>(null);

export function LocaleAdapterProvider({
  adapter,
  children,
}: {
  adapter: LocaleAdapter;
  children: ReactNode;
}) {
  return (
    <LocaleAdapterContext.Provider value={adapter}>
      {children}
    </LocaleAdapterContext.Provider>
  );
}

export function useLocaleAdapter(): LocaleAdapter {
  const ctx = use(LocaleAdapterContext);
  if (!ctx) {
    throw new Error(
      "useLocaleAdapter must be used within <LocaleAdapterProvider>",
    );
  }
  return ctx;
}
