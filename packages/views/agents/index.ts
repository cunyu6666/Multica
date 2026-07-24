/**
 * [WHO]: Provides barrel exports for the agents module — AgentsPage,
 *   AgentDetailPage, and AgentCreationStudio.
 * [FROM]: Depends on ./components for the three page-level components.
 * [TO]: Consumed by apps/web and apps/desktop routing layers.
 * [HERE]: packages/views/agents/index.ts - Barrel export for agents module.
 */
export { AgentsPage, AgentDetailPage, AgentCreationStudio } from "./components";
