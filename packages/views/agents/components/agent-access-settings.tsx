/**
 * [WHO]: Provides a standalone AgentAccessSettings settings card wrapping
 *   the AccessPicker for agent permission management views.
 * [FROM]: Depends on @multica/core/types, settings-layout components,
 *   i18n, and inspector/access-picker.
 * [TO]: Consumed by agent detail settings pages that surface access
 *   control as a standalone section.
 * [HERE]: packages/views/agents/components/agent-access-settings.tsx -
 *   Settings-card wrapper for agent access/permission configuration.
 */
"use client";

import type { Agent, MemberWithUser } from "@multica/core/types";
import {
  SettingsCard,
  SettingsSection,
} from "../../settings/components/settings-layout";
import { useT } from "../../i18n";
import { AccessPicker } from "./inspector/access-picker";

export function AgentAccessSettings({
  agent,
  members,
  currentUserId,
  onDirtyChange,
  onUpdate,
}: {
  agent: Agent;
  members: MemberWithUser[];
  currentUserId: string | null;
  onDirtyChange?: (dirty: boolean) => void;
  onUpdate: (id: string, data: Record<string, unknown>) => Promise<void>;
}) {
  const { t } = useT("agents");

  return (
    <SettingsSection
      title={t(($) => $.access.section_title)}
      description={t(($) => $.inspector.section_access_hint)}
    >
      <SettingsCard>
        <AccessPicker
          permissionMode={agent.permission_mode}
          invocationTargets={agent.invocation_targets}
          visibility={agent.visibility}
          members={members}
          ownerId={agent.owner_id}
          canEdit={
            currentUserId !== null && agent.owner_id === currentUserId
          }
          hasComposioAllowlist={
            (agent.composio_toolkit_allowlist ?? []).length > 0
          }
          onDirtyChange={onDirtyChange}
          onChange={(next) => onUpdate(agent.id, next)}
        />
      </SettingsCard>
    </SettingsSection>
  );
}
