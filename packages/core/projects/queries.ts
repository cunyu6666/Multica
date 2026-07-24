/**
 * [WHO]: Provides React Query query options for projects (list and detail)
 * [FROM]: Depends on @tanstack/react-query, ../api
 * [TO]: Consumed by project list views, project detail pages, and any component
 *        that reads project data or project-scoped issue filters
 * [HERE]: packages/core/projects/queries.ts - React Query query options for
 *         listing projects and fetching individual project details
 */

import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const projectKeys = {
  all: (wsId: string) => ["projects", wsId] as const,
  list: (wsId: string) => [...projectKeys.all(wsId), "list"] as const,
  detail: (wsId: string, id: string) =>
    [...projectKeys.all(wsId), "detail", id] as const,
};

export function projectListOptions(wsId: string) {
  return queryOptions({
    queryKey: projectKeys.list(wsId),
    queryFn: () => api.listProjects(),
    select: (data) => data.projects,
  });
}

export function projectDetailOptions(wsId: string, id: string) {
  return queryOptions({
    queryKey: projectKeys.detail(wsId, id),
    queryFn: () => api.getProject(id),
  });
}
