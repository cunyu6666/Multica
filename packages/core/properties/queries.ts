/**
 * [WHO]: Provides TanStack Query keys and options for property list
 * [FROM]: Depends on @tanstack/react-query, ../api
 * [TO]: Consumed by property settings views and issue property consumers
 * [HERE]: packages/core/properties/queries.ts - property query layer
 */
import { queryOptions } from "@tanstack/react-query";
import { api } from "../api";

export const propertyKeys = {
  all: (wsId: string) => ["properties", wsId] as const,
  list: (wsId: string, includeArchived = false) =>
    [...propertyKeys.all(wsId), "list", includeArchived] as const,
};

export function propertyListOptions(wsId: string, includeArchived = false) {
  return queryOptions({
    queryKey: propertyKeys.list(wsId, includeArchived),
    queryFn: () => api.listProperties(includeArchived),
    select: (data) => data.properties,
  });
}
