/**
 * [WHO]: Re-exports skills view store with scopes, sort, columns, and filters.
 * [FROM]: Depends on ./view-store
 * [TO]: Consumed by skills list page and filter components
 * [HERE]: packages/core/skills/stores/index.ts - Skills view store barrel
 */
export {
  useSkillsViewStore,
  DEFAULT_HIDDEN_COLUMNS,
  EMPTY_SKILL_FILTERS,
  SKILL_SORT_DEFAULT_DIRECTION,
  type SkillColumnKey,
  type SkillListFilters,
  type SkillOriginType,
  type SkillSortDirection,
  type SkillSortField,
  type SkillsViewState,
} from "./view-store";
