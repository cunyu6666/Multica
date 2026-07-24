/**
 * [WHO]: Provides time formatting helpers for elapsed durations used by chat status indicators
 * [FROM]: No internal dependencies (pure utility)
 * [TO]: Consumed by task-status-pill.tsx and chat-message-list for elapsed time display
 * [HERE]: packages/views/chat/lib/format.ts - formatElapsedSecs and formatElapsedMs for consistent time display
 */

 * (over a minute). Drops the seconds part when the remainder is 0 to
 * keep round-minute readings short ("3m" rather than "3m 0s"). Shared
 * by the live StatusPill timer and the persistent assistant-message
 * timing line — keeping them in lockstep avoids visible drift between
 * "Working · 38s" mid-flight and a final "Replied in 39s" caption.
 */
export function formatElapsedSecs(secs: number): string {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

/** Convenience: same formatting, but the input is milliseconds (server-stored elapsed_ms). */
export function formatElapsedMs(ms: number): string {
  return formatElapsedSecs(Math.max(0, Math.round(ms / 1000)));
}
