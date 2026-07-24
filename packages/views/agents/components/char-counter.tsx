/**
 * [WHO]: Provides CharCounter — a length/max counter with soft-warn at 90%
 *   and hard-error styling past the limit.
 * [FROM]: Depends on i18n for the over-limit message.
 * [TO]: Consumed by agent description editor and create-agent dialog.
 * [HERE]: packages/views/agents/components/char-counter.tsx - Character
 *   counter with warning/error color thresholds.
 */
"use client";

import { useT } from "../../i18n";

// Soft warn at 90 % of the cap, hard error past it. Shared between the
// description editor (modal) and the create-agent dialog so both surfaces
// read the same way. Renders a single inline line so it can sit under any
// textarea / input without disturbing surrounding spacing.
export function CharCounter({ length, max }: { length: number; max: number }) {
  const { t } = useT("agents");
  const over = length > max;
  const near = !over && length >= Math.floor(max * 0.9);
  const tone = over
    ? "text-destructive"
    : near
      ? "text-warning"
      : "text-muted-foreground";
  return (
    <div className={`text-right text-xs tabular-nums ${tone}`}>
      {length} / {max}
      {over && t(($) => $.char_counter.over_limit, { count: length - max })}
    </div>
  );
}
