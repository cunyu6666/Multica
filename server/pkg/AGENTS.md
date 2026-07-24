# server/pkg/

> P2 | Parent: ../../AGENTS.md

## Member List

agent/: manages 20+ AI agent CLI integrations (Claude, Codex, Copilot, Cursor, Grok, Qwen, etc.), implementing agent registration, version gating, execution protocols (JSON envelope, stream-json, MCP), cross-platform process invocation, thinking mode configuration, and stderr tailing
composio/: provides a standalone Go SDK for the Composio v3.1 REST API, covering connected account links, MCP session creation, toolkit/tool enumeration, tool execution, and HMAC-SHA256 webhook signature verification
db/: holds sqlc-generated database access layer — `queries/` contains hand-written SQL (.sql), `generated/` contains Go query implementations, models, and the db.go connector for 35+ database entities
featureflag/: implements Martin Fowler's Toggle Point / Toggle Router / Toggle Configuration pattern for server-side feature flags, supporting YAML rule files, environment variable overrides, deterministic percent rollouts via consistent hashing, and safe defaults
llm/: provides a thin wrapper around the OpenAI Go SDK for lightweight LLM calls (chat completions, streaming, GenerateText), supporting configurable base URL, API key, default model, retries, and timeout — targeting OpenAI and OpenAI-compatible gateways
protocol/: defines the canonical set of ~80 WebSocket event type constants (task, agent, issue, chat, daemon, integration lifecycle events) used for real-time communication between server, web clients, and daemons
redact/: implements secret detection and redaction for agent output, scanning against 15+ regex patterns (AWS keys, GitHub tokens, API keys, PEM keys, JWTs, connection strings, Slack tokens, etc.) and masking the local user's home directory path
skillbundle/: provides skill classification logic for routing and organizing agent skills by type and intent
taskfailure/: defines the canonical 21-value failure reason taxonomy (7 platform-side + 14 agent-side) persisted in agent_task_queue.failure_reason, with error classification, IsAgentError predicate, and AllReasons for Prometheus label pre-warming
