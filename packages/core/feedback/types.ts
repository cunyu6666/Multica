/**
 * [WHO]: Provides feedback kind constants and create feedback response types.
 * [FROM]: No internal dependencies
 * [TO]: Consumed by feedback mutations, draft store, and form components
 * [HERE]: packages/core/feedback/types.ts - Feedback types and kind constants
 */
export const FEEDBACK_KINDS = ["bug", "feature", "general", "praise"] as const;

export type FeedbackKind = (typeof FEEDBACK_KINDS)[number];

export interface CreateFeedbackResponse {
  id: string;
  created_at: string;
}
