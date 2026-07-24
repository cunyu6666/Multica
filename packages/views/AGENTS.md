# views/

> P2 | Parent: ../../AGENTS.md

## Member List

assets.d.ts: Declares TypeScript module types for `*.png` and `*.svg` asset imports as `string | StaticImageAsset` union to support both Vite (string URL) and Next.js (StaticImageData) consumers.
vitest.config.ts: Exports Vitest configuration with `jsdom` environment, global test helpers, React plugin, and `./test/setup.ts` setup file; includes `**/*.test.{ts,tsx}` patterns.
