/**
 * [WHO]: Re-exports label queries and mutations (including resource labels)
 * [FROM]: Depends on ./queries, ./mutations
 * [TO]: Consumed by views/pages that render label management and issue labels
 * [HERE]: packages/core/labels/index.ts - barrel export for label API layer
 */
export { labelKeys, labelListOptions, issueLabelsOptions, resourceLabelsOptions } from "./queries";
export {
  useCreateLabel,
  useUpdateLabel,
  useDeleteLabel,
  useAttachLabel,
  useAttachLabelToIssue,
  useDetachLabel,
  useAttachResourceLabel,
  useDetachResourceLabel,
} from "./mutations";
