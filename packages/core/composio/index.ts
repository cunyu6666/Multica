/**
 * [WHO]: Re-exports Composio toolkit and connection queries
 * [FROM]: Depends on ./queries
 * [TO]: Consumed by Composio integration settings and agent MCP config
 * [HERE]: packages/core/composio/index.ts - barrel export for Composio module
 */
export { composioKeys, composioToolkitsOptions, composioConnectionsOptions } from "./queries";
