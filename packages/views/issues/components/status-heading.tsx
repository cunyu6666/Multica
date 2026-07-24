/**
 * [WHO]: Provides a compact status heading with icon and count for column headers
 * [FROM]: Depends on @multica/core/types, ./status-icon, ../../i18n
 * [TO]: Consumed by board-column.tsx, list-view.tsx, and swimlane-view.tsx as column headers
 * [HERE]: packages/views/issues/components/status-heading.tsx - StatusHeading with status icon and item count
 */
import type { IssueStatus } from "@multica/core/types";
import { StatusIcon } from "./status-icon";
import { useT } from "../../i18n";

export function StatusHeading({
  status,
  count,
}: {
  status: IssueStatus;
  count: number;
}) {
  const { t } = useT("issues");
  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
        <StatusIcon status={status} className="h-3 w-3" />
        {t(($) => $.status[status])}
      </span>
      <span className="text-xs text-muted-foreground">{count}</span>
    </div>
  );
}
