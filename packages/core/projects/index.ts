/**
 * [WHO]: Re-exports project queries, mutations, draft store, and view store
 * [FROM]: Depends on ./queries, ./mutations, ./draft-store, ./stores/view-store, ./resource-queries
 * [TO]: Consumed by project views and pages
 * [HERE]: packages/core/projects/index.ts - barrel export for project API layer
 */
export { projectKeys, projectListOptions, projectDetailOptions } from "./queries";
export { useCreateProject, useUpdateProject, useDeleteProject } from "./mutations";
export { useProjectDraftStore } from "./draft-store";
export {
  useProjectViewStore,
  PROJECT_SORT_DEFAULT_DIRECTION,
  PROJECT_DEFAULT_HIDDEN_COLUMNS,
  EMPTY_PROJECT_FILTERS,
  type ProjectViewMode,
  type ProjectSortField,
  type ProjectSortDirection,
  type ProjectColumnKey,
  type ProjectListFilters,
} from "./stores/view-store";
export {
  projectResourceKeys,
  projectResourcesOptions,
  useCreateProjectResource,
  useUpdateProjectResource,
  useDeleteProjectResource,
} from "./resource-queries";
