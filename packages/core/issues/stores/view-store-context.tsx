/**
 * [WHO]: Provides React Context wrapper for dynamically-created issue view stores,
 * enabling useViewStore/useViewStoreApi hooks within provider trees.
 * [FROM]: Depends on react, zustand, view-store
 * [TO]: Consumed by issue list pages that create their own view stores
 * [HERE]: packages/core/issues/stores/view-store-context.tsx - ViewStore React Context provider
 */
"use client";

import { createContext, use } from "react";
import { useStore, type StoreApi } from "zustand";
import type { IssueViewState } from "./view-store";

const ViewStoreContext = createContext<StoreApi<IssueViewState> | null>(null);

export function ViewStoreProvider({
  store,
  children,
}: {
  store: StoreApi<IssueViewState>;
  children: React.ReactNode;
}) {
  return (
    <ViewStoreContext.Provider value={store}>
      {children}
    </ViewStoreContext.Provider>
  );
}

export function useViewStore<T>(selector: (state: IssueViewState) => T): T {
  const store = use(ViewStoreContext);
  if (!store)
    throw new Error("useViewStore must be used within ViewStoreProvider");
  return useStore(store, selector);
}

export function useViewStoreApi(): StoreApi<IssueViewState> {
  const store = use(ViewStoreContext);
  if (!store)
    throw new Error("useViewStoreApi must be used within ViewStoreProvider");
  return store;
}
