/**
 * [WHO]: Provides Logger interface, createLogger, and noopLogger - a lightweight, namespace-scoped console logger with colored output and a no-op variant
 * [FROM]: Depends on browser console API; no external packages
 * [TO]: Consumed by packages/core/platform/core-provider.tsx, packages/core/platform/auth-initializer.tsx, packages/core/chat/store.ts, packages/core/chat/mutations.ts, packages/core/realtime/provider.tsx, packages/core/realtime/use-realtime-sync.ts, packages/core/api/ws-client.ts, packages/core/api/schema.ts, packages/core/api/client.ts, and packages/views/chat/components/*
 * [HERE]: packages/core/logger.ts - pure logging utilities; sibling utils.ts holds ID/IME utilities, this file owns structured logging with timestamped, namespaced, color-coded output
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const COLORS: Record<LogLevel, string> = {
  debug: "color:#888",
  info: "color:#2196F3",
  warn: "color:#FF9800",
  error: "color:#F44336;font-weight:bold",
};

const CONSOLE_METHOD: Record<LogLevel, "log" | "info" | "warn" | "error"> = {
  debug: "log",
  info: "info",
  warn: "warn",
  error: "error",
};

export interface Logger {
  debug(msg: string, ...data: unknown[]): void;
  info(msg: string, ...data: unknown[]): void;
  warn(msg: string, ...data: unknown[]): void;
  error(msg: string, ...data: unknown[]): void;
}

export function createLogger(namespace: string): Logger {
  const make =
    (level: LogLevel) =>
    (msg: string, ...data: unknown[]) => {
      const ts = new Date().toISOString().slice(11, 23);
      const prefix = `%c${ts} [${namespace}]`;
      if (data.length > 0) {
        console[CONSOLE_METHOD[level]](prefix, COLORS[level], msg, ...data);
      } else {
        console[CONSOLE_METHOD[level]](prefix, COLORS[level], msg);
      }
    };

  return {
    debug: make("debug"),
    info: make("info"),
    warn: make("warn"),
    error: make("error"),
  };
}

/** No-op logger for when logging is not needed. */
export const noopLogger: Logger = {
  debug() {},
  info() {},
  warn() {},
  error() {},
};
