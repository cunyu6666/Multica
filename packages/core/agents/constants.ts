/**
 * [WHO]: Defines agent-related constants (description max length)
 * [FROM]: No dependencies
 * [TO]: Consumed by agent creation forms, validation, and test suites
 * [HERE]: packages/core/agents/constants.ts - agent UI constraints and limits
 */
// User-facing limits enforced symmetrically on the front-end (UI counter +
// disabled save) and the back-end (handler validation + DB CHECK constraint).
// Kept in core so both apps and the test suite read from one source.
export const AGENT_DESCRIPTION_MAX_LENGTH = 255;
