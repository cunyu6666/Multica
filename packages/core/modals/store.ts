/**
 * [WHO]: Provides global modal state (open/close modals with data payload)
 * [FROM]: Depends on zustand
 * [TO]: Consumed by modal index barrel and views that trigger modals
 * [HERE]: packages/core/modals/store.ts - single-responder modal Zustand store
 */
"use client";

import { create } from "zustand";

type ModalType =
  | "create-workspace"
  | "create-issue"
  | "quick-create-issue"
  | "create-project"
  | "create-squad"
  | "feedback"
  | "issue-set-parent"
  | "issue-add-child"
  | "issue-delete-confirm"
  | "issue-run-confirm"
  | null;

interface ModalStore {
  modal: ModalType;
  data: Record<string, unknown> | null;
  open: (modal: NonNullable<ModalType>, data?: Record<string, unknown> | null) => void;
  close: () => void;
}

export const useModalStore = create<ModalStore>((set) => ({
  modal: null,
  data: null,
  open: (modal, data = null) => set({ modal, data }),
  close: () => set({ modal: null, data: null }),
}));
