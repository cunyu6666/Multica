# apps/desktop/

> P2 | Parent: ../../AGENTS.md

## Member List

electron-builder.yml: Configures Electron app packaging — code signing, notarization, distributable formats (DMG/ZIP for macOS, NSIS for Windows, AppImage/Deb for Linux), auto-update channels, and entitlements.
electron.vite.config.ts: Configures the Electron + Vite build pipeline — main process bundling, renderer aliasing, preload script compilation, and dev server hot-reload.
package.json: Declares Electron app dependencies, build scripts, and electron-builder metadata.
src/main/: Electron main process — app lifecycle (index.ts), daemon process management (daemon-manager, daemon-os, daemon-auth-probe), auto-updater (updater, updater-preferences), window state management, navigation gestures/guard, notification gate, keyboard shortcuts, external URL handling, context menu, CLI bootstrap/release, version decision, renderer recovery, freeze breadcrumb tracking.
src/preload/: Electron preload layer — contextBridge exposing IPC channels between main and renderer, TypeScript type declarations for exposed APIs.
src/renderer/: Electron renderer process — React app shell with react-router-dom routing, workspace dashboard, shared views from packages/views/, platform-specific wiring (window overlays, drag strip, title bar, workspace switcher).
src/shared/: Shared types and utilities between main and renderer processes — auth session management, daemon IPC types, issue window contracts, main/renderer message protocol, window state types.
