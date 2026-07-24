/**
 * [WHO]: Provides React Query query options for pinned items (list per user)
 * [FROM]: Depends on @tanstack/react-query, ../api
 * [TO]: Consumed by navigation sidebar pin lists and any view that renders
 *        user-pinned shortcuts to issues, projects, or other resources
 * [HERE]: packages/core/pins/queries.ts - React Query query options for listing
 *         user-pinned items
 */

import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const pinKeys = {
  all: (wsId: string, userId: string) => ["pins", wsId, userId] as const,
  list: (wsId: string, userId: string) => [...pinKeys.all(wsId, userId), "list"] as const,
};

export function pinListOptions(wsId: string, userId: string) {
  return queryOptions({
    queryKey: pinKeys.list(wsId, userId),
    queryFn: () => api.listPins(),
  });
}
