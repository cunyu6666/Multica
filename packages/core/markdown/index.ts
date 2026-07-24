/**
 * [WHO]: Re-exports markdown utilities (mention shortcode preprocessor)
 * [FROM]: Depends on ./mention-shortcodes
 * [TO]: Consumed by @multica/ui/markdown and mobile markdown renderer
 * [HERE]: packages/core/markdown/index.ts - barrel export for markdown utilities
 */
export { preprocessMentionShortcodes } from "./mention-shortcodes";
