/**
 * [WHO]: Provides ChatPage and FloatingChat components for the chat view layer
 * [FROM]: Depends on chat-page.tsx and floating-chat.tsx for chat UI and floating chat FAB
 * [TO]: Consumed by app routers and layout components that need to embed chat functionality
 * [HERE]: packages/views/chat/index.ts - Barrel export for chat module; re-exports the two top-level chat views
 */

export { ChatPage } from "./chat-page";
export { FloatingChat } from "./floating-chat";
