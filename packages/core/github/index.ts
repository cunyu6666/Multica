/**
 * [WHO]: Re-exports GitHub queries, PR status derivation, settings, and settings hook
 * [FROM]: Depends on ./queries, ./pull-request-status, ./settings, ./use-github-settings
 * [TO]: Consumed by GitHub integration views and PR sidebar
 * [HERE]: packages/core/github/index.ts - barrel export for GitHub module
 */
export * from "./queries";
export * from "./pull-request-status";
export * from "./settings";
export * from "./use-github-settings";
