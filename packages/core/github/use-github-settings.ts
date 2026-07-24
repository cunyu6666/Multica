/**
 * [WHO]: Provides GitHub settings hook derived from current workspace settings
 * [FROM]: Depends on react, ../paths, ./settings
 * [TO]: Consumed by GitHub integration views and PR sidebar visibility gates
 * [HERE]: packages/core/github/use-github-settings.ts - GitHub settings hook
 */
"use client";

import { useMemo } from "react";
import { useCurrentWorkspace } from "../paths";
import { deriveGitHubSettings, type GitHubSettings } from "./settings";

/**
 * Reads the GitHub feature flags off the current workspace's settings JSONB.
 * Components downstream should consult this hook rather than poking at
 * `workspace.settings` directly, so the per-flag fallback semantics
 * (see deriveGitHubSettings) stay consistent.
 */
export function useGitHubSettings(): GitHubSettings {
  const workspace = useCurrentWorkspace();
  return useMemo(() => deriveGitHubSettings(workspace), [workspace]);
}
