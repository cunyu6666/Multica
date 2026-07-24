/**
 * [WHO]: Re-exports inbox queries, mutations, and WebSocket updaters
 * [FROM]: Depends on ./queries, ./mutations, ./ws-updaters
 * [TO]: Consumed by inbox views and pages
 * [HERE]: packages/core/inbox/index.ts - barrel export for inbox API layer
 */
export * from "./queries";
export * from "./mutations";
export * from "./ws-updaters";
