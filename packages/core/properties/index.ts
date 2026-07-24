/**
 * [WHO]: Re-exports property queries and mutations
 * [FROM]: Depends on ./queries, ./mutations
 * [TO]: Consumed by property views and issue property editors
 * [HERE]: packages/core/properties/index.ts - barrel export for properties module
 */
export { propertyKeys, propertyListOptions } from "./queries";
export {
  useCreateProperty,
  useUpdateProperty,
  useSetIssueProperty,
  useUnsetIssueProperty,
} from "./mutations";
