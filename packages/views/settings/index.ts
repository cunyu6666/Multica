/**
 * [WHO]: Provides SettingsPage, layout primitives (SettingsCard, SettingsRow, SettingsSection, SettingsTab, SettingsSaveState), and ExtraSettingsTab type
 * [FROM]: Depends on components/index.ts and components/settings-layout.tsx for settings UI composition
 * [TO]: Consumed by app routes and workspace configuration pages that render settings views
 * [HERE]: packages/views/settings/index.ts - Barrel export for settings module; re-exports page, layout components, and tab extension type
 */

export { SettingsPage } from "./components";
export type { ExtraSettingsTab } from "./components";
export {
  SettingsCard,
  SettingsRow,
  SettingsSaveState,
  SettingsSection,
  SettingsTab,
} from "./components/settings-layout";
export type {
  SettingsSaveStatus,
} from "./components/settings-layout";
