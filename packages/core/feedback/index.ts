/**
 * [WHO]: Re-exports feedback mutations, types, and draft store.
 * [FROM]: Depends on ./mutations, ./types, ./draft-store
 * [TO]: Consumed by feedback form views and components
 * [HERE]: packages/core/feedback/index.ts - Feedback barrel exports
 */
export * from "./mutations";
export { FEEDBACK_KINDS } from "./types";
export type { CreateFeedbackResponse, FeedbackKind } from "./types";
export { useFeedbackDraftStore } from "./draft-store";
