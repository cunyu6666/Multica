# service/

> P2 | Parent: ../../../AGENTS.md

## Member List

agent_ready.go: provides AgentReadiness check that determines if an agent can accept new work (archived_at IS NULL, runtime_id IS NOT NULL, runtime status online), returning reason for failure
autopilot.go: handles autopilot run lifecycle — enqueue tasks from issue triggers, manage cron-based scheduling, squad coordination, and run state transitions
builtin_skills.go: provides BuiltinSkills function that returns platform built-in skills from embedded builtin_skills/ directory via embed.FS at compile time
cron.go: provides NextOccurrenceAfterUTC that parses 5-field cron expressions in named IANA timezones and returns the next activation strictly after a given time
email.go: handles email delivery via SMTP — constructs MIME messages with HTML/text parts, handles TLS connections, quoted-printable encoding, and attachment support
empty_claim_cache.go: provides Redis-backed cache that stores "no queued task" verdicts per runtime with version tracking (emptyClaimVersionKey monotonic counter) to skip claim attempts
issue.go: handles issue business logic — creation with position assignment, status transitions, assignee changes, and autopilot trigger evaluation
issue_trigger.go: provides RunEnqueueSource enum (RunSourceAssign/RunSourceCreate/RunSourceLabel/RunSourcePromote) and trigger evaluation logic that determines which issue writes start agent runs
squad_no_action.go: provides HasSquadLeaderNoActionEvaluationForTask that checks if a task already recorded a squad leader no_action evaluation, preventing duplicate evaluations
task.go: handles task lifecycle business logic — claim/coalesce/complete/fail/cancel with race condition prevention, deduplication, and broadcast event emission
