/**
 * [WHO]: Provides OnboardingFlow, CliInstallInstructions, CloudWaitlistExpand, and SourceBackfillModal for the onboarding experience
 * [FROM]: Depends on onboarding-flow.tsx, step components, cloud-waitlist-expand.tsx, and source-backfill-modal.tsx
 * [TO]: Consumed by app entry routes and workspace setup flows that guide new users
 * [HERE]: packages/views/onboarding/index.ts - Barrel export for onboarding module; re-exports flow, steps, and modals
 */

export { OnboardingFlow, type OnboardingStep } from "./onboarding-flow";
export { CliInstallInstructions } from "./steps/cli-install-instructions";
export { CloudWaitlistExpand } from "./components/cloud-waitlist-expand";
export { SourceBackfillModal } from "./source-backfill-modal";
