/**
 * [WHO]: Provides React Query query options for labels (list by resource type,
 *        labels by issue, labels by resource for agents/skills)
 * [FROM]: Depends on @tanstack/react-query, ../api, ../types (LabelResourceType)
 * [TO]: Consumed by label management views, issue detail label pickers, and
 *        agent/skill detail pages that show attached labels
 * [HERE]: packages/core/labels/queries.ts - React Query query options for listing
 *         labels globally, per issue, and per resource (agent/skill)
 */

import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";
import type { LabelResourceType } from "../types";

export const labelKeys = {
  all: (wsId: string) => ["labels", wsId] as const,
  list: (wsId: string, resourceType: LabelResourceType = "issue") =>
    [...labelKeys.all(wsId), "list", resourceType] as const,
  detail: (wsId: string, id: string) =>
    [...labelKeys.all(wsId), "detail", id] as const,
  byIssue: (wsId: string, issueId: string) =>
    [...labelKeys.all(wsId), "issue", issueId] as const,
  byResource: (wsId: string, resourceType: "agent" | "skill", resourceId: string) =>
    [...labelKeys.all(wsId), resourceType, resourceId] as const,
};

export function labelListOptions(wsId: string, resourceType: LabelResourceType = "issue") {
  return queryOptions({
    queryKey: labelKeys.list(wsId, resourceType),
    queryFn: () => api.listLabels(resourceType),
    select: (data) => data.labels,
  });
}

export function resourceLabelsOptions(
  wsId: string,
  resourceType: "agent" | "skill",
  resourceId: string,
) {
  return queryOptions({
    queryKey: labelKeys.byResource(wsId, resourceType, resourceId),
    queryFn: () => api.listLabelsForResource(resourceType, resourceId),
    select: (data) => data.labels,
    enabled: Boolean(resourceId),
  });
}

export function issueLabelsOptions(wsId: string, issueId: string) {
  return queryOptions({
    queryKey: labelKeys.byIssue(wsId, issueId),
    queryFn: () => api.listLabelsForIssue(issueId),
    select: (data) => data.labels,
    enabled: Boolean(issueId),
  });
}
