/**
 * Shared trigger styling for inspector pickers (Runtime / Model / Visibility /
 * Concurrency).
 *
 * The defining choices:
 * - `rounded-md` (6px) — soft enough to feel like a button, not a tab.
 * - `hover:bg-accent` — single hover layer carries the entire "this is a
 *   button" signal. We tried adding a hover-border on top, but layered hover
 *   states (border + bg) made the chip outline busier without adding info.
 * - `min-w-0` so children that `truncate` don't overflow the inspector's
 *   320px column.
 *
 * No default border on purpose: at rest the chip should sit quietly inside
 * the row; the moment the cursor enters, the bg flips and the affordance is
 * obvious.
 */
/**
 * [WHO]: Provides shared CHIP_CLASS styling for inspector picker chips —
 *   consistent rounded, hover, and min-w styling across all property pickers.
 * [FROM]: None — pure CSS class string constant.
 * [TO]: Consumed by all inspector pickers (access, concurrency, model,
 *   runtime, service-tier, thinking, visibility) for consistent chip styling.
 * [HERE]: packages/views/agents/components/inspector/chip.ts - Shared CSS
 *   class for inspector picker chip buttons.
 */
export const CHIP_CLASS =
  "group flex min-w-0 cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 text-xs transition-colors hover:bg-accent";
