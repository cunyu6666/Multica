/**
 * [WHO]: Provides MemberProfileCard and MemberDetailPage components for member management views
 * [FROM]: Depends on member-profile-card.tsx and member-detail-page.tsx for member UI
 * [TO]: Consumed by workspace settings and member listing pages
 * [HERE]: packages/views/members/index.ts - Barrel export for members module; re-exports profile card and detail page
 */

export { MemberProfileCard } from "./member-profile-card";
export { MemberDetailPage } from "./member-detail-page";
