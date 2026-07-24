/**
 * [WHO]: Provides the floating chat overlay mount point (FAB + window) for the dashboard layout
 * [FROM]: Depends on @multica/core/chat, @multica/core/paths, ../navigation, ./components/chat-fab, ./components/chat-window
 * [TO]: Consumed by app shell dashboard layouts
 * [HERE]: packages/views/chat/floating-chat.tsx - FloatingChat component that gates overlay visibility based on settings and route
 */
"use client";

import { useChatStore } from "@multica/core/chat";
import { useWorkspacePaths } from "@multica/core/paths";
import { useNavigation } from "../navigation";
import { ChatFab } from "./components/chat-fab";
import { ChatWindow } from "./components/chat-window";

/**
 * Mount point for the floating chat overlay (FAB + window). Rendered once in
 * each app shell's dashboard layout; owns the two gates that decide whether the
 * overlay exists at all:
 *
 *  1. The Settings → Chat preference (`floatingChatEnabled`). When a user turns
 *     the floating window off, Chat lives only in its dedicated tab.
 *  2. The Chat tab route itself. On `/:slug/chat` the full-page surface already
 *     owns the conversation, so a floating copy of the same `activeSessionId`
 *     would be pure duplication — hide it there.
 */
export function FloatingChat() {
  const enabled = useChatStore((s) => s.floatingChatEnabled);
  const { pathname } = useNavigation();
  const wsPaths = useWorkspacePaths();

  if (!enabled) return null;
  // Suppress on the Chat tab — it renders the same conversation full-page.
  if (pathname === wsPaths.chat() || pathname.startsWith(`${wsPaths.chat()}/`)) {
    return null;
  }

  return (
    <>
      <ChatWindow />
      <ChatFab />
    </>
  );
}
