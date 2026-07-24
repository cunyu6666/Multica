/**
 * [WHO]: Provides TanStack Query keys and options for VCS connections
 * [FROM]: Depends on @tanstack/react-query, ../api
 * [TO]: Consumed by VCS integration views and settings
 * [HERE]: packages/core/vcs/queries.ts - VCS connection query layer
 */
import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const vcsKeys = {
  all: (wsId: string) => ["vcs", wsId] as const,
  connections: (wsId: string) => [...vcsKeys.all(wsId), "connections"] as const,
};

export const vcsConnectionsOptions = (wsId: string) =>
  queryOptions({
    queryKey: vcsKeys.connections(wsId),
    queryFn: () => api.listVCSConnections(wsId),
    enabled: !!wsId,
  });
