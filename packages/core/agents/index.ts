/**
 * [WHO]: Provides agent management — presence detection (derive-presence, use-agent-presence),
 *        effective access computation, agent activity tracking, MCP support, visibility labels,
 *        OpenClaw runtime config, and agent-related stores (transcript-view, view-store)
 * [FROM]: Depends on ./derive-presence for presence logic, ./effective-access for access
 *        computation, ./queries for agent data, ./use-agent-activity for activity hooks,
 *        ./mcp-support for MCP protocol, ./openclaw-runtime-config for runtime configuration
 * [TO]: Consumed by agent UI components, packages/core/realtime/ (presence sync),
 *        workspace settings pages, and any feature that displays or manages agents
 */

export * from "./types";
export * from "./derive-presence";
export * from "./effective-access";
export * from "./queries";
export * from "./use-agent-presence";
export * from "./use-update-agent-allowlist";
export * from "./use-agent-activity";
export * from "./use-workspace-presence-prefetch";
export * from "./constants";
export * from "./visibility-label";
export * from "./use-workspace-agent-availability";
export * from "./mcp-support";
export * from "./openclaw-runtime-config";
