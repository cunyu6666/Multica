/**
 * [WHO]: Re-exports Slack installation queries
 * [FROM]: Depends on ./queries
 * [TO]: Consumed by Slack integration settings views
 * [HERE]: packages/core/slack/index.ts - barrel export for Slack module
 */
export { slackKeys, slackInstallationsOptions } from "./queries";
