/**
 * [WHO]: Provides issue subscriber types for notification tracking
 * [FROM]: No internal dependencies
 * [TO]: Consumed by issues/, notification system, API schema parsing
 * [HERE]: packages/core/types/subscriber.ts - Issue subscriber type definition
 */

export interface IssueSubscriber {
  issue_id: string;
  user_type: "member" | "agent";
  user_id: string;
  reason: "creator" | "assignee" | "commenter" | "mentioned" | "manual";
  created_at: string;
}
