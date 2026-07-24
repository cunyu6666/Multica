/**
 * [WHO]: Public API barrel for permissions module (types, rules, hooks)
 * [FROM]: Depends on ./types, ./rules, ./use-resource-permissions
 * [TO]: Consumed by views across the app for permission checks
 * [HERE]: packages/core/permissions/index.ts - public permissions API surface
 */
/**
 * Public API for the permissions module.
 *
 * Exports only what the views currently consume. The full pure-rule set lives
 * in `./rules` and is available to tests and future surfaces directly. Adding
 * a new rule to the public API should follow the same minimum-surface pattern
 * — only export when there's a caller.
 */
export type {
  Decision,
  DecisionReason,
  PermissionContext,
} from "./types";

export { canAssignAgentToIssue, canEditAgent } from "./rules";

export {
  useAgentPermissions,
  useSkillPermissions,
} from "./use-resource-permissions";
