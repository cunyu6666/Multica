/**
 * [WHO]: Resolves public file URLs for workspace avatars and assets
 * [FROM]: Depends on ../api (base URL resolution)
 * [TO]: Consumed by hooks.ts for avatar URL resolution and upload URL builders
 * [HERE]: packages/core/workspace/avatar-url.ts - public file URL resolver
 */
import { api } from "../api";

export function resolvePublicFileUrlWithBase(rawUrl: string | null | undefined, baseUrl: string): string | null {
  if (!rawUrl) return null;
  if (!rawUrl.startsWith("/")) return rawUrl;
  const trimmedBaseUrl = baseUrl.replace(/\/+$/, "");
  return `${trimmedBaseUrl}${rawUrl}`;
}

export function resolvePublicFileUrl(rawUrl: string | null | undefined): string | null {
  return resolvePublicFileUrlWithBase(rawUrl, api.getBaseUrl());
}
