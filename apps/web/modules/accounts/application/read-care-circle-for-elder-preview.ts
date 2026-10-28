import {
  getFamilyContext,
  listUserMemberships,
} from "@/modules/accounts/application/family-context";
import { canViewCareRoutine } from "@/modules/accounts/domain/roles";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ElderPreviewMemberPhone {
  id: string;
  displayName: string;
  relationshipLabel: string | null;
  phone: string | null;
}

export interface ElderCircleMemberInput {
  id: string;
  kind: "member" | "invite";
  situation: "active" | "pending" | "expired";
  displayName: string;
  relationshipLabel: string | null;
  phone: string | null;
}

export interface CareCircleForElderPreview {
  careRecipientDisplayName: string;
  members: ElderPreviewMemberPhone[];
}

export function selectActiveMembersForElder(
  rows: ElderCircleMemberInput[],
): ElderPreviewMemberPhone[] {
  return rows
    .filter((row) => row.kind === "member" && row.situation === "active")
    .map((row) => ({
      id: row.id,
      displayName: row.displayName,
      relationshipLabel: row.relationshipLabel,
      phone: row.phone,
    }));
}

/** Leitura para a prévia: nome da pessoa cuidada e telefone dos membros ativos. */
export async function readCareCircleForElderPreview(): Promise<CareCircleForElderPreview | null> {
  const ctx = await getFamilyContext();
  if (
    !ctx.accountId ||
    !ctx.role ||
    !ctx.userId ||
    !ctx.careRecipientId ||
    !canViewCareRoutine(ctx.role)
  ) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const memberships = await listUserMemberships(supabase, ctx.userId);
  const membership =
    memberships.find((item) => item.accountId === ctx.accountId) ?? null;

  const rows = await fetchParticipantRows(supabase, ctx.accountId);
  return {
    careRecipientDisplayName: membership?.careRecipientDisplayName?.trim() ?? "",
    members: selectActiveMembersForElder(rows),
  };
}
