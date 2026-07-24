/**
 * Public surface for @multica/core/feature-flags.
 *
 * Keep this list minimal — every new export becomes a contract we have to
 * preserve across the monorepo. Add to it only when a real caller appears.
 */
/**
 * [WHO]: Public barrel for @multica/core/feature-flags (types, service, providers, hooks, hash)
 * [FROM]: Depends on ./types, ./service, ./static-provider, ./chain-provider, ./keys, ./context, ./hash
 * [TO]: Consumed by all feature flag consumers across web, desktop, and mobile
 * [HERE]: packages/core/feature-flags/index.ts - public API surface for feature flags
 */

export type {
  Decision,
  EvalContext,
  PercentRollout,
  Provider,
  Reason,
  Rule,
} from "./types";

export { FeatureFlagService } from "./service";
export { StaticProvider } from "./static-provider";
export { ChainProvider } from "./chain-provider";
export {
  COMPOSIO_MCP_APPS_FLAG,
  RESOURCE_LABELS_FLAG,
} from "./keys";
export {
  FeatureFlagsProvider,
  useFeatureFlagService,
  useFlag,
  useVariant,
} from "./context";

// Hash helpers are exported for tests and for callers that want to share
// the bucketing logic without going through a Provider (rare; usually a
// red flag that the caller should be using the Service instead).
export { bucketFor, inPercent } from "./hash";
