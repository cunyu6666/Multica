/**
 * [WHO]: Provides mutation hooks for submitting user feedback (bug, feature, etc.).
 * [FROM]: Depends on @tanstack/react-query, api, ./types
 * [TO]: Consumed by feedback form submit handlers
 * [HERE]: packages/core/feedback/mutations.ts - Feedback submission mutation
 */
import { useMutation } from "@tanstack/react-query";
import { api } from "../api";
import type { FeedbackKind } from "./types";

export interface CreateFeedbackInput {
  message: string;
  url?: string;
  workspace_id?: string;
  kind?: FeedbackKind;
}

export function useCreateFeedback() {
  return useMutation({
    mutationFn: (input: CreateFeedbackInput) => api.createFeedback(input),
  });
}
