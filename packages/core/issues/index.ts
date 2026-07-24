/**
 * [WHO]: Provides issue management — store (useIssueStore), GraphQL queries/mutations,
 *        WS live updaters, configuration (priority/status), and sub-stores (selection,
 *        view, draft, comment composer, create-mode, etc.)
 * [FROM]: Depends on ./store for Zustand issue store, ./queries for GraphQL queries,
 *        ./mutations for GraphQL mutations, ./ws-updaters for live sync, ./config for
 *        priority/status enums, ./stores for view and UI state stores
 * [TO]: Consumed by issue-related UI components, packages/core/realtime/ (live sync),
 *        packages/core/chat/ (issue references in chat), and any feature surfacing issues
 */

export * from "./store";
export * from "./queries";
export * from "./mutations";
export * from "./ws-updaters";
export * from "./config";
export * from "./stores";
