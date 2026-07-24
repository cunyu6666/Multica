/**
 * [WHO]: Provides task status configuration mapping statuses to labels,
 *   icons, and color tokens for agent task rendering.
 * [FROM]: Depends on lucide-react for status icons.
 * [TO]: Consumed by agent task UI surfaces that need consistent status
 *   labels and colors.
 * [HERE]: packages/views/agents/config.ts - Task status icon/color mapping.
 */
import {
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Play,
} from "lucide-react";

export const taskStatusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  queued: { label: "Queued", icon: Clock, color: "text-muted-foreground" },
  dispatched: { label: "Dispatched", icon: Play, color: "text-info" },
  running: { label: "Running", icon: Loader2, color: "text-brand" },
  completed: { label: "Completed", icon: CheckCircle2, color: "text-success" },
  failed: { label: "Failed", icon: XCircle, color: "text-destructive" },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-muted-foreground" },
};
