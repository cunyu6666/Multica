# Repository Guidelines

This file provides guidance to AI agents when working with code in this repository.

> **Single source of truth:** This file is a concise pointer document.
> All authoritative architecture, coding rules, and conventions
> live in **CLAUDE.md** at the project root. Read that file first.
> Use `Makefile`, `package.json`, and `pnpm-workspace.yaml` as the
> source of truth for the full command list.

## Quick Reference

### Architecture

Go backend + monorepo frontend (pnpm workspaces + Turborepo) with shared packages.

- `server/` - Go backend (Chi router, sqlc, gorilla/websocket)
- `apps/web/` - Next.js frontend (App Router)
- `apps/desktop/` - Electron desktop app
- `packages/core/` - Headless business logic (Zustand stores, React Query hooks, API client)
- `packages/ui/` - Atomic UI components (shadcn/Base UI, zero business logic)
- `packages/views/` - Shared business pages/components
- `packages/tsconfig/` - Shared TypeScript config

### State Management (critical)

- **React Query** owns all server state (issues, members, agents, inbox, workspace list)
- **Zustand** owns client/view state (view filters, drafts, modals, desktop tab state); current workspace identity is route-driven and only mirrored for platform plumbing
- All Zustand stores live in `packages/core/` - never in `packages/views/` or app directories
- WS events update React Query for server data; store writes are only for clearing client-owned pointers with a single responder/self-event guard

### Package Boundaries (hard rules)

- `packages/core/` - zero react-dom, zero localStorage, zero process.env
- `packages/ui/` - zero `@multica/core` imports
- `packages/views/` - zero `next/*`, zero `react-router-dom`, use `NavigationAdapter` for routing
- `apps/web/platform/` - only place for Next.js APIs

### Database Migrations (hard rules)

- Never add database foreign keys or cascading actions. Enforce relationships and perform dependent cleanup explicitly in the application layer, using transactions when the operation must be atomic.
- Every index created by a migration, including unique indexes and indexes on new tables, must use `CREATE [UNIQUE] INDEX CONCURRENTLY`. Keep each concurrent index build in its own single-statement migration file.

### Commands

```bash
make dev              # Auto-setup + start everything
pnpm typecheck        # TypeScript check
pnpm test             # TS unit tests (Vitest)
make test             # Go tests
make check            # Full verification pipeline
```

See CLAUDE.md for the authoritative rules and common commands.

## DIP Navigation

### P1 — Root

- [P1: This File](./AGENTS.md)
- [CLAUDE.md](./CLAUDE.md) — Authoritative conventions, state rules, package boundaries, API compatibility

### P2 — Module Maps

- [P2: server/internal/handler/](./server/internal/handler/AGENTS.md) — HTTP handlers (agents, chat, issues, runtimes, skills, integrations, VCS, daemon)
- [P2: server/internal/service/](./server/internal/service/AGENTS.md) — Business logic (agent readiness, autopilots, email, issue/task lifecycle, skills, squads)
- [P2: server/internal/middleware/](./server/internal/middleware/AGENTS.md) — Auth, rate limiting, CSP, request logging, workspace scoping
- [P2: server/pkg/](./server/pkg/AGENTS.md) — Agent CLI integrations, sqlc DB layer, feature flags, LLM, WebSocket protocol, redaction
- [P2: packages/core/](./packages/core/AGENTS.md) — Headless business logic, React Query hooks, Zustand stores, API client
- [P2: packages/ui/](./packages/ui/AGENTS.md) — Atomic UI components (shadcn/Base UI), hooks, styles
- [P2: packages/views/](./packages/views/AGENTS.md) — Shared business pages, layout, navigation, i18n
- [P2: apps/web/](./apps/web/AGENTS.md) — Next.js App Router, middleware, MDX schemas
- [P2: apps/mobile/](./apps/mobile/AGENTS.md) — Expo/React Native mobile app
- [P2: apps/desktop/](./apps/desktop/AGENTS.md) — Electron desktop app

### P3 — File Contracts

- `packages/core/` — 62 文件: 根级 6 + 子目录 barrel 6 + 扩展 50 (api client/schema/ws-client/schemas, issues queries/mutations/ws-updaters/store/cache-helpers, chat queries/mutations/store/unread, realtime provider/use-realtime-sync/hooks, inbox queries/mutations/ws-updaters, labels/pins/projects queries+mutations, auth store/utils, platform 8 files, types 6 files, dashboard queries, projects draft/view-store)
- `server/internal/handler/` — 86 文件: 全部生产环境 .go 文件（含 auth, issue, chat, agent, runtime, workspace 等所有 handler）
- `server/internal/service/` — 10 文件: agent_ready, autopilot, builtin_skills, cron, email, empty_claim_cache, issue, issue_trigger, squad_no_action, task
- `server/internal/middleware/` — 9 文件: auth, client, cloudfront, csp, daemon_auth, owner_lookup, ratelimit, request_logger, workspace
- `packages/views/` — 43 文件: 根级 4 + 子目录 barrel 6 + 扩展 33 (layout dashboard-guard/page-header, navigation context/app-link, auth login-page/use-logout, issues detail/list-row, chat input/window, dashboard page, settings 5 files, members 2 files, inbox 4 files, agents 4 files, onboarding 5 files, projects 2 files)
