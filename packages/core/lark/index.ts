/**
 * [WHO]: Re-exports Lark queries for bot installation checks.
 * [FROM]: Depends on ./queries
 * [TO]: Consumed by views that check Lark integration status
 * [HERE]: packages/core/lark/index.ts - Lark barrel exports
 */
export { larkKeys, larkInstallationsOptions } from "./queries";
