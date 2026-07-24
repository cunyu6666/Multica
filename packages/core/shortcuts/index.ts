/**
 * [WHO]: Re-exports shortcut utilities, definitions, and platform helpers.
 * [FROM]: Depends on ./platform, ./definitions, ./store
 * [TO]: Consumed by views and platform layers that handle keyboard shortcuts
 * [HERE]: packages/core/shortcuts/index.ts - Shortcuts barrel exports
 */
export {
  SHORTCUT_ACTIONS,
  SHORTCUT_ACTION_BY_ID,
  createShortcutChord,
  shortcutFromEvent,
  shortcutChordEquals,
  shortcutMatchesEvent,
  isPlainShortcut,
  formatShortcut,
  isEditableShortcutTarget,
  isReservedShortcut,
  isShortcutAllowedForAction,
  type ShortcutActionDefinition,
  type ShortcutActionId,
  type ShortcutCategory,
  type ShortcutChord,
  type ShortcutModifiers,
} from "./definitions";
export {
  configureShortcutPlatform,
  configureShortcutRuntime,
  detectShortcutPlatform,
  detectShortcutRuntime,
  getShortcutPlatform,
  getShortcutRuntime,
  type ShortcutPlatform,
  type ShortcutRuntime,
} from "./platform";
export {
  useShortcutStore,
  useShortcut,
  resolveShortcut,
  getShortcut,
  findShortcutConflict,
  type ShortcutOverrides,
} from "./store";
