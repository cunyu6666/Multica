/**
 * [WHO]: Provides Zustand store for issue client view state (active issue selection)
 * [FROM]: Depends on zustand
 * [TO]: Consumed by views that need to track the currently active/selected issue independently from server state
 * [HERE]: packages/core/issues/store.ts - Zustand store for issue client state (active issue tracking)
 */
"use client";

import { create } from "zustand";

interface IssueClientState {
  activeIssueId: string | null;
  setActiveIssue: (id: string | null) => void;
}

export const useIssueStore = create<IssueClientState>((set) => ({
  activeIssueId: null,
  setActiveIssue: (id) => set({ activeIssueId: id }),
}));
