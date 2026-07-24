/**
 * [WHO]: Provides re-exports for the public surface of settings components —
 *        SettingsPage, ExtraSettingsTab type, and LabelsTab.
 * [FROM]: Re-exports from ./settings-page and ./labels-tab (which pull in their own deps).
 * [TO]: Consumed by apps/web and apps/desktop wherever settings pages are mounted.
 * [HERE]: packages/views/settings/components/index.ts - Public barrel for settings components
 */
export { SettingsPage } from "./settings-page";
export type { ExtraSettingsTab } from "./settings-page";
export { LabelsTab } from "./labels-tab";
