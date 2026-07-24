/**
 * [WHO]: Provides URL sanitization utilities (sanitizeNextUrl) for validating
 *        post-login redirect URLs against open redirect attacks
 * [FROM]: No runtime dependencies — pure function
 * [TO]: Consumed by packages/core/auth/index.ts (re-exported), auth UI components
 *        that handle redirect-after-login flows
 * [HERE]: packages/core/auth/utils.ts - Safe redirect URL validation helper
 *         that only allows single-slash relative paths
 */

/**
 * Validate a post-login redirect URL and return it only if safe to follow.
 *
 * Only single-slash relative paths (e.g. `/invite/abc`) are accepted. Returns
 * `null` for unsafe or empty input — call sites decide the fallback so this
 * helper never overloads a specific path with "user did not pass next".
 *
 * Rejects:
 *   - `null` / empty string
 *   - absolute URLs (`https://evil.com`, `javascript:alert(1)`, …)
 *   - protocol-relative URLs (`//evil.com`)
 *   - paths containing backslashes (Windows-style or `/\\host`)
 *   - paths containing ASCII control characters (`\x00`–`\x1f`)
 */
export function sanitizeNextUrl(raw: string | null): string | null {
  if (!raw) return null;
  if (!raw.startsWith("/") || raw.startsWith("//")) return null;
  // eslint-disable-next-line no-control-regex -- intentional: rejecting control chars is the whole point
  if (/[\x00-\x1f\\]/.test(raw)) return null;
  return raw;
}
