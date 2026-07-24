# handler/

> P2 | Parent: ../../../AGENTS.md

## Member List

activity.go: handles issue timeline/activity feed reads, merges activity log entries with comments into a unified TimelineEntry DTO sorted by created_at
actor_guards.go: provides RequireHumanActor middleware that rejects machine-authenticated requests (mat_ task tokens, mcn_ cloud-node PATs) for human-only endpoints
admission.go: defines unified execution-admission contract (MUL-4525) with AttemptAdmission/AdmissionResult shape used by all synchronous enqueue entry points (queued/coalesced/deferred/blocked)
agent.go: handles full agent CRUD — create/list/get/update/archive with agent type detection (helper/user/squad), emoji avatars, runtime binding, and analytics tracking
agent_access.go: manages agent invocation allow-list entries (MUL-3963), providing AgentInvocationTargetDTO wire shape for workspace/member/team-scoped agent access control
agent_avatar.go: provides agent emoji avatar assignment (emoji: prefixed strings from a curated emoji pool) and random avatar generation using crypto/rand
agent_builder.go: handles agent builder template CRUD, managing predefined agent templates with default skills, MCP configs, and prompt overrides
agent_env.go: manages per-agent environment variable CRUD (create/list/get/delete) with secret masking in list responses
agent_permission.go: implements agent invocation permission model (MUL-3963) with two gates: canViewAgent for visibility and canInvokeAgent for execution, resolving workspace/member/team targets
agent_runtime_skills.go: handles agent-scoped local skill CRUD (list/get/create/update/delete) with skill file tree management and skill enable/disable toggles
agent_template.go: handles agent template CRUD with predefined templates (code-review, bug-triage, etc.), each bundling default skills and MCP server configs
auth.go: handles OAuth2 authentication flow (Google/GitHub), session cookie management, JWT issuance, logout, and signup with analytics tracking
autopilot.go: handles autopilot configuration CRUD (create/list/get/update/delete) including cron schedules, issue filters, agent bindings, and squad mode
autopilot_cron_preview.go: provides cron schedule preview endpoint that parses 5-field cron expressions in IANA timezones and returns next N occurrence timestamps with rejection codes for invalid cron/timezone
autopilot_webhook.go: handles VCS webhook delivery for autopilot-triggered runs, verifying webhook signatures and dispatching to the appropriate autopilot/agent pipeline
chat.go: handles chat message CRUD within issues, including message creation with @mentions, edit/delete, and real-time WebSocket broadcast to subscribers
chat_history.go: provides paginated chat message history retrieval with cursor-based pagination, loading messages before/after a given cursor for infinite scroll
chat_pinned_agent.go: manages user's quick-agent bar pins (max 5), providing ChatPinnedAgentResponse with agent metadata for the chat input's agent selector
chat_title.go: handles chat session title generation and management, using LLM or heuristic title extraction from the first message
client_usage.go: provides client usage telemetry endpoint that records feature usage events with client metadata (platform/version/OS) for analytics dashboards
cloud_billing.go: proxies billing API requests to multica-cloud HTTP service on :8080, forwarding verbatim to /api/v1/billing/* with auth passthrough
cloud_runtime.go: handles cloud runtime provisioning — create/list/get/destroy Fleet API proxy to multica-cloud, with runtime status tracking and cloud-signed CDN cookie refresh
comment.go: handles issue comment CRUD with rich text sanitization, mention resolution, decision tracking (approve/request_changes), and reconciliation for VCS-synced comments
config.go: provides app configuration endpoint returning AppConfig (CDN domain, signed CDN flag, feature flags, analytics keys) for client bootstrap
contact_sales.go: handles contact-sales form submission, recording lead info (name/email/company/message) and sending notification emails
daemon.go: manages daemon WebSocket connection lifecycle, registering/unregistering runtime connections with the DaemonHub for real-time command dispatch
daemon_rpc.go: provides in-memory rpcResponseCapture for WS RPC reuse, allowing daemon WebSocket requests to delegate to existing HTTP handlers without network round-trips
daemon_workspace.go: handles daemon workspace queries, returning DaemonWorkspaceResponse with workspace ID/name/slug for the connected runtime's workspace context
daemon_ws.go: handles daemon WebSocket upgrade and message framing, proxying between the daemon process and the server's DaemonHub
dashboard.go: provides workspace/project dashboard reads — issue counts, active runs, recent activity, and agent health status for the workspace overview
feedback.go: handles user feedback submission (thumbs up/down, text feedback) with analytics event tracking and optional screenshot attachment upload
handler.go: provides central Handler struct and New() constructor wiring all routes, plus writeJSON helper, resolveActor, loadIssueForUser, loadAgentForUser, loadSkillForUser, requireDaemonRuntimeAccess, and UUID parsing utilities (parseUUIDOrBadRequest, parseUUID, parseUUIDSafe)
file.go: handles file operations — upload/download/list/delete for workspace files, with CloudFront signed URL generation for private CDN access and MIME type detection
github.go: handles GitHub integration — OAuth flow, webhook verification (HMAC-SHA256), repo linking, issue sync, and PR status polling
heartbeat_scheduler.go: provides HeartbeatScheduler abstraction that decides how runtime heartbeat requests reach the database (direct DB write vs Redis TTL key batching)
inbox.go: handles user inbox/notifications — list/mark-as-read/bulk-dismiss with pagination, filtering by notification type (mention/assign/status_change)
integrations_composio.go: handles Composio integration CRUD (MUL-3720 Stage 2 MVP) — connect/disconnect/list connected accounts and trigger Composio tool executions
invitation.go: handles workspace member invitations — create/list/accept/revoke invites with email delivery, token-based invite links, and role assignment (admin/member)
issue.go: handles full issue CRUD — create/list/get/update/delete with position tracking, status transitions, assignee management, and analytics event tracking
issue_child_done.go: handles child issue completion propagation — when all children of a parent issue reach done status, automatically transitions the parent issue
issue_metadata.go: handles issue metadata CRUD — custom fields, labels, estimates, and issue-level properties with schema validation
issue_move.go: handles issue move between projects/workspaces, updating position, project references, and broadcasting issue:moved events
issue_reaction.go: handles issue reactions (emoji reactions) — add/remove/list reactions with deduplication per user per reaction type
issue_table_facets.go: provides table facet aggregation — counts by status/assignee/label/priority for filter sidebar UI, using GROUP BY queries
issue_table_group.go: handles issue table grouping — returns grouped issue rows by a specified column (status/assignee/label) for kanban/grouped views
issue_table_query.go: provides issue table query parsing and execution — converts query strings into SQL filters for the issue list view
issue_table_rows.go: handles paginated issue table row retrieval with cursor-based pagination, sorting, and filter application for the issue list view
issue_trigger.go: handles autopilot issue trigger preview — given a cron schedule and issue filter, previews which issues would be enqueued and from which source (assign/create/label/promote)
label.go: handles issue label CRUD — create/list/update/delete/rename with label color management, merge-on-rename deduplication, and usage counting
lark.go: handles Lark (Feishu) integration — OAuth flow, webhook verification, message sync, and bot command dispatch for Lark workspaces
mcp_overlay.go: provides mergeMCPOverlay that layers per-task MCP config overlays on top of an agent's saved mcp_config for the daemon claim wire shape
notification_preference.go: handles user notification preferences CRUD — per-group (system_notifications/mentions/assignments) toggle with validation against validNotifGroups set
onboarding.go: handles workspace onboarding flow — creates initial agents, starter issues, and demo projects for new workspace setup
onboarding_shim.go: provides DEPRECATED BootstrapOnboarding endpoints for desktop < v3 compatibility, creating Helper agents and starter issues via inline DB calls
personal_access_token.go: handles PAT (Personal Access Token) CRUD — create/list/revoke with token hash storage (SHA256), expiry management, and scope-based permissions
pin.go: handles pinned items (issues/projects) for workspace sidebar — create/list/delete pins with PinnedItemResponse carrying pin metadata only (no cross-entity cache invalidation)
project.go: handles project CRUD — create/list/get/update/archive with project slug validation, member access control, and project-level agent bindings
project_resource.go: handles project resource links — attach/detach/list external resources (repos, docs, dashboards) to projects for contextual linking
property.go: handles workspace property/schema CRUD — custom property definitions with type validation (text/number/select/date), default values, and visibility scoping
reaction.go: handles comment/issue reaction CRUD — add/remove/list reactions with emoji validation, per-user-per-reaction deduplication, and reaction count aggregation
runtime.go: handles agent runtime lifecycle — create/list/get/update status, with runtime type detection (local/cloud), heartbeat tracking, and connection management
runtime_liveness_store.go: provides LivenessStore interface for tracking short-lived "runtime heartbeated recently" records using Redis TTL keys instead of DB writes on every beat
runtime_local_skills.go: handles local skill list/import request management — frontend creates requests, daemon claims them on heartbeat, daemon reports results back
runtime_local_skills_redis_store.go: provides Redis-backed implementation of LocalSkillListStore/LocalSkillImportStore with distributed locking and TTL'd keys for multi-node dispatch
runtime_models.go: handles model list request management — frontend requests available models, daemon claims on heartbeat, daemon returns model list with capabilities
runtime_models_redis_store.go: provides Redis-backed implementation of ModelListStore with the same distributed dispatch pattern as runtime_local_skills_redis_store
runtime_profile.go: handles runtime profiling — CPU/memory/disk stats collection from daemon heartbeats, exposing runtime health metrics for the dashboard
runtime_update.go: handles CLI update request management — frontend creates pending update requests, daemon claims on heartbeat, daemon reports update results
runtime_update_redis_store.go: provides Redis-backed implementation of UpdateStore with TTL'd keys and distributed locking matching the local skills store pattern
search.go: provides issue and project full-text search using LOWER(col) LIKE queries with searchStatementTimeout Postgres-level timeout to prevent runaway queries
skill.go: handles skill CRUD — create/list/get/update/delete with skill validation, file tree management, and skill metadata (name/description/version) tracking
skill_create.go: handles skill creation with workspace scoping, skill file validation (SKILL.md required), and skill package ZIP upload/extract
skill_import_archive.go: handles skill import from ZIP archives — validates archive structure, extracts SKILL.md and supporting files, registers skill in workspace
slack.go: handles Slack integration — OAuth flow, event webhook verification, message sync, channel linking, and slash command dispatch for Slack workspaces
squad.go: handles squad (multi-agent team) CRUD — create/list/get/update/delete squad composition, with squad leader election and member agent coordination
squad_briefing.go: provides squadOperatingProtocolHeader system-level briefing prepended to every squad-leader claim, explaining coordinator role and @mention dispatch mechanism
subscriber.go: handles issue subscriber management — list/add/remove subscribers with SubscriberResponse containing issue_id/user_type/user_id for notification routing
task_lifecycle.go: handles agent task lifecycle transitions — claim/start/complete/fail/cancel with state machine validation, result persistence, and event broadcasting
vcs.go: handles VCS (Git) operations — repo clone/fetch/branch/diff/commit for agent workspaces, with VCS provider abstraction (GitHub/GitLab/Bitbucket)
vcs_webhook.go: handles VCS webhook delivery — verifies webhook signatures, parses push/PR events, and dispatches to appropriate issue/task handlers
webhook_delivery.go: handles webhook delivery to external endpoints — HTTP POST with retry logic, signature generation, and delivery status tracking
webhook_delivery_worker.go: provides background worker for async webhook delivery queue processing with exponential backoff retry and dead-letter handling
webhook_rate_limiter.go: provides WebhookRateLimit sliding-window rate limiter (default 60 req/60s per token) using Redis to prevent hammering from misconfigured senders
workspace.go: handles workspace CRUD — create/list/get/update with slug validation against reserved slugs, member management, and workspace-level settings
workspace_reserved_slugs.go: provides reserved workspace slug list loaded from embedded reserved_slugs.json, blocking slugs that collide with frontend routes or platform names
workspace_revoke.go: handles member revocation via revokeAndRemoveMember — archives runtimes, pins, cancels in-flight tasks when a member leaves a workspace
