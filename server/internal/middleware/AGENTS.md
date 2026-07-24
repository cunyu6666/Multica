# middleware/

> P2 | Parent: ../../../AGENTS.md

## Member List

auth.go: provides Auth middleware that validates JWT tokens (mat_ task tokens, mcn_ cloud-node PATs, session cookies) and populates request context with authenticated user identity
client.go: provides ClientMetadata middleware that extracts X-Client-Platform/X-Client-Version/X-Client-OS headers into request context for client-aware logging and gating
cloudfront.go: provides RefreshCloudFrontCookies middleware that regenerates CloudFront signed cookies on authenticated requests when cookies are missing/expired
csp.go: provides CSP (Content Security Policy) middleware that sets Content-Security-Policy header with default-src 'self', script-src 'self', frame-ancestors 'none' policy
daemon_auth.go: provides DaemonAuth middleware that validates daemon-to-server authentication via shared secret or mutual TLS, rejecting unauthorized daemon connections
owner_lookup.go: provides ownerLookupFor that returns an auth.OwnerLookupFunc querying the user table to verify ownerID is a real row, used by mcn_ auth branches
ratelimit.go: provides rate limiting middleware using Redis Lua scripts (rateLimitScript) for atomic counter increment with TTL, protecting endpoints from abuse
request_logger.go: provides RequestLogger middleware that logs HTTP request/response metadata (method/path/status/duration) using structured slog with chi request ID integration
workspace.go: provides workspace-scoped middleware that resolves workspace from URL path parameter, validates user membership, and populates context with workspace data
