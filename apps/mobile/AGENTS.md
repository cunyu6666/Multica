# apps/mobile/

> P2 | Parent: ../../AGENTS.md

## Member List

app.config.ts: Configures Expo app metadata (name, slug, bundle identifier, scheme, plugins, build settings) for EAS build and OTA update pipelines.
app/: Expo Router file-based routing — `_layout.tsx` (root layout with auth/realtime providers), `index.tsx` (workspace selection/entry), workspace-scoped route trees with formSheet/modal presentations.
data/: Mobile-local data layer — ApiClient with fetchValidated/fetchValidatedWith pattern, TanStack Query client, Zustand stores (auth, workspace, chat-select, comment-select, viewed-issues), Zod schemas, secure storage, query key factories.
docs/: Architecture docs — RNR migration plan, project gap audit, v1 plan, markdown rendering ADR, research notes.
lib/: Shared utilities — attachment dedup/URL, auth error handling, agent assignment, filter logic, formatting (time-ago, elapsed, activity), inbox display, inline color, issue status, mention serialization, response parsing, project status, quick emojis, request ID, markdown stripping, theme, timeline coalescing/threading, unread counts, agent presence, color scheme, mention input, native search bar.
