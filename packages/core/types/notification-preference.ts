/**
 * [WHO]: Provides notification preference types for per-group mute settings
 * [FROM]: No internal dependencies
 * [TO]: Consumed by notification-preferences/, settings, API schema parsing
 * [HERE]: packages/core/types/notification-preference.ts - Notification preference type definitions
 */

export type NotificationGroupKey =
  | "assignments"
  | "status_changes"
  | "comments"
  | "updates"
  | "agent_activity"
  | "system_notifications";

export type NotificationGroupValue = "all" | "muted";

export type NotificationPreferences = Partial<Record<NotificationGroupKey, NotificationGroupValue>>;

export interface NotificationPreferenceResponse {
  workspace_id: string;
  preferences: NotificationPreferences;
}
