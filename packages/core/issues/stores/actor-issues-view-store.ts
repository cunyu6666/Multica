/**
 * [WHO]: Provides actor issues view state (assigned/created scope) with workspace-aware
 * persistence, list-only default view mode.
 * [FROM]: Depends on zustand/vanilla, zustand/middleware, view-store, workspace-storage
 * [TO]: Consumed by Actor tasks panel and list renderers
 * [HERE]: packages/core/issues/stores/actor-issues-view-store.ts - Actor issues view store
 */
"use client";

import { createStore, type StoreApi } from "zustand/vanilla";
import { persist } from "zustand/middleware";
import {
  type IssueViewState,
  viewStoreSlice,
  viewStorePersistOptions,
  mergeViewStatePersisted,
} from "./view-store";
import { registerForWorkspaceRehydration } from "../../platform/workspace-storage";

export type ActorIssuesScope = "assigned" | "created";

export interface ActorIssuesViewState extends IssueViewState {
  scope: ActorIssuesScope;
  setScope: (scope: ActorIssuesScope) => void;
}

const basePersist = viewStorePersistOptions("multica_actor_issues_view");

const _actorIssuesViewStore = createStore<ActorIssuesViewState>()(
  persist(
    (set) => ({
      ...viewStoreSlice(set as unknown as StoreApi<IssueViewState>["setState"]),
      // Actor tasks panel is list-only; override the slice's "board" default.
      viewMode: "list",
      scope: "assigned" as ActorIssuesScope,
      setScope: (scope: ActorIssuesScope) => set({ scope }),
    }),
    {
      name: basePersist.name,
      storage: basePersist.storage,
      partialize: (state: ActorIssuesViewState) => ({
        ...basePersist.partialize(state),
        scope: state.scope,
      }),
      merge: mergeViewStatePersisted<ActorIssuesViewState>,
    },
  ),
);

export const actorIssuesViewStore: StoreApi<ActorIssuesViewState> =
  _actorIssuesViewStore;

registerForWorkspaceRehydration(() =>
  _actorIssuesViewStore.persist.rehydrate(),
);
