/**
 * [WHO]: Provides workspace-scoped issue scope preference (all/members/agents).
 * [FROM]: Depends on zustand, zustand/middleware, workspace-storage, platform/storage
 * [TO]: Consumed by issues list header and scope filter components in views
 * [HERE]: packages/core/issues/stores/issues-scope-store.ts - Issue scope toggle store
 */
"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { createWorkspaceAwareStorage, registerForWorkspaceRehydration } from "../../platform/workspace-storage";
import { defaultStorage } from "../../platform/storage";

export type IssuesScope = "all" | "members" | "agents";

interface IssuesScopeState {
  scope: IssuesScope;
  setScope: (scope: IssuesScope) => void;
}

export const useIssuesScopeStore = create<IssuesScopeState>()(
  persist(
    (set) => ({
      scope: "all",
      setScope: (scope) => set({ scope }),
    }),
    {
      name: "multica_issues_scope",
      storage: createJSONStorage(() => createWorkspaceAwareStorage(defaultStorage)),
    },
  ),
);

registerForWorkspaceRehydration(() => useIssuesScopeStore.persist.rehydrate());
