# apps/web/

> P2 | Parent: ../../AGENTS.md

## Member List

next-env.d.ts: Declares Next.js TypeScript type references and imports generated route types, enabling type-safe App Router compilation.

next.config.ts: Configures the Next.js application (MDX via fumadocs, dotenv loading, dev/prod hostname resolution, CORS origins, rewrites and proxy routing).

proxy.test.ts: Unit tests for the proxy middleware, covering locale resolution, cookie-based redirects, legacy URL rewrites, and host-based routing.

proxy.ts: Implements the Next.js middleware that handles locale resolution, legacy workspace URL rewrites, runtime API/docs URL rewriting, and marketing host routing.

source.config.ts: Configures Fumadocs MDX content collections (defineDocs) with custom frontmatter schemas for use-cases, including hero_image, updated_at, and category fields.

vitest.config.ts: Configures the Vitest test runner with jsdom environment, React plugin, @/ and @core/ path aliases, and glob pattern for .test.{ts,tsx} files.
