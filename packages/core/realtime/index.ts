/**
 * [WHO]: Provides real-time synchronization via WebSocket (WSProvider/useWS), event hooks
 *        (useWSEvent/useWSReconnect), and issue/chat sync integration (useRealtimeSync)
 * [FROM]: Depends on ./provider for WSProvider context, ./hooks for WS event/reconnect hooks,
 *        ./use-realtime-sync for cache synchronization across stores
 * [TO]: Consumed by app root (WSProvider wrapper), packages/core/issues/ (live issue updates),
 *        packages/core/chat/ (live message sync), and any module requiring push-based updates
 */

export { WSProvider, useWS } from "./provider";
export type { WSProviderProps } from "./provider";
export { useWSEvent, useWSReconnect } from "./hooks";
export { useRealtimeSync, removeChatMessageFromCaches } from "./use-realtime-sync";
export type { RealtimeSyncStores } from "./use-realtime-sync";
