/**
 * [WHO]: Provides a Zustand persist store for project creation/edit drafts (title,
 *        description, status, priority, lead, dates) with workspace-aware storage
 *        and auto-rehydration on workspace switch
 * [FROM]: Depends on zustand, zustand/middleware (persist, createJSONStorage),
 *        ../types (ProjectStatus, ProjectPriority),
 *        ../platform/workspace-storage, ../platform/storage
 * [TO]: Consumed by project create/edit dialogs that need to preserve form state
 *        across navigation or accidental closes
 * [HERE]: packages/core/projects/draft-store.ts - Zustand persist store for
 *         project draft form state with workspace-scoped localStorage
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProjectStatus, ProjectPriority } from "../types";
import { createWorkspaceAwareStorage, registerForWorkspaceRehydration } from "../platform/workspace-storage";
import { defaultStorage } from "../platform/storage";

interface ProjectDraft {
  title: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  leadType?: "member" | "agent";
  leadId?: string;
  icon?: string;
  // Calendar days ("YYYY-MM-DD"); empty/undefined means unset.
  startDate?: string;
  dueDate?: string;
}

const EMPTY_DRAFT: ProjectDraft = {
  title: "",
  description: "",
  status: "planned",
  priority: "none",
  leadType: undefined,
  leadId: undefined,
  icon: undefined,
  startDate: undefined,
  dueDate: undefined,
};

interface ProjectDraftStore {
  draft: ProjectDraft;
  setDraft: (patch: Partial<ProjectDraft>) => void;
  clearDraft: () => void;
  hasDraft: () => boolean;
}

export const useProjectDraftStore = create<ProjectDraftStore>()(
  persist(
    (set, get) => ({
      draft: { ...EMPTY_DRAFT },
      setDraft: (patch) =>
        set((s) => ({ draft: { ...s.draft, ...patch } })),
      clearDraft: () =>
        set({ draft: { ...EMPTY_DRAFT } }),
      hasDraft: () => {
        const { draft } = get();
        return !!(draft.title || draft.description);
      },
    }),
    {
      name: "multica_project_draft",
      storage: createJSONStorage(() => createWorkspaceAwareStorage(defaultStorage)),
    },
  ),
);

registerForWorkspaceRehydration(() => useProjectDraftStore.persist.rehydrate());
