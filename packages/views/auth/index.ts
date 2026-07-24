/**
 * [WHO]: Provides authentication UI components (LoginPage) and session management hooks (useLogout)
 * [FROM]: Depends on login-page module (login flow, CLI callback validation/redirect) and use-logout module for session termination
 * [TO]: Consumed by apps/web/app/(auth)/login/page.tsx, apps/web/app/auth/callback/page.tsx, apps/desktop/src/renderer/src/pages/login.tsx, apps/desktop/src/renderer/src/platform/daemon-reauth.ts for authentication flows
 * [HERE]: packages/views/auth/index.ts - Public API surface for authentication views; re-exports login page component and logout hook
 */

export { LoginPage, validateCliCallback, redirectToCliCallback } from "./login-page";
export { useLogout } from "./use-logout";
