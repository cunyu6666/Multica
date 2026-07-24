/**
 * [WHO]: Provides human-readable labels for the backend task failure reason
 *   enum, surfaced in the agent detail Recent Work tab.
 * [FROM]: Depends on @multica/core/types (TaskFailureReason).
 * [TO]: Consumed by the activity tab for displaying failure context.
 * [HERE]: packages/views/agents/components/tabs/task-failure.ts - Task
 *   failure reason label mapping.
 */
import type { TaskFailureReason } from "@multica/core/types";

// Human-readable copy for the back-end task failure reason enum. Surfaced
// in the agent detail Recent Work tab when a task ended in failure — the
// only place the front-end exposes failure_reason directly to the user.
//
// Lives next to the consuming tab (rather than in agents/presence) because
// failed tasks no longer have a top-level workload state; failure context
// is purely a detail-page concern now.
export const failureReasonLabel: Record<TaskFailureReason, string> = {
  agent_error: "Agent execution error",
  timeout: "Task timed out",
  codex_semantic_inactivity: "Codex semantic inactivity timeout",
  runtime_offline: "Daemon offline",
  runtime_recovery: "Daemon restarted",
  manual: "Cancelled by user",
};
