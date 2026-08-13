import { familyContent } from "@/content/family";
import { buildAvatarInitials } from "@/modules/accounts/application/login-routing";
import {
  canInviteOrChangeRoles,
  getRoleDisplayLabel,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  buildParticipantSubtitle,
  buildParticipantTitle,
} from "@/modules/accounts/domain/invite-lifecycle";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface ParticipantListItem {
  id: string;
  kind: "member" | "invite";
  initials: string;
  title: string;
  subtitle: string;
  roleLabel: string;
  situationLabel: string;
  situationTone: "ok" | "warning" | "muted";
  canResend: boolean;
  inviteId: string | null;
  isSelf: boolean;
  emergencyNote: string | null;
}

export interface ParticipantesPageViewModel {
  participants: ParticipantListItem[];
  careRecipientDisplayName: string;
  canInvite: boolean;
  isPaused: boolean;
  openModal: boolean;
  autoEmailSendAvailable: boolean;
}

export type ParticipantesPageResult =
  | { ok: true; data: ParticipantesPageViewModel }
  | { ok: false; message: string };

function resolveSituationDisplay(
  situation: "active" | "pending" | "expired",
): { label: string; tone: "ok" | "warning" | "muted" } {
  const copy = familyContent.participantes.situation;
  return copy[situation];
}

export async function getParticipantesPage(input: {
  modal?: string | null;
  now?: Date;
}): Promise<ParticipantesPageResult> {
  try {
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, message: "Cadastro incompleto." };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role) {
      return { ok: false, message: "Cadastro incompleto." };
    }

    const supabase = await createSupabaseServerClient();
    const rows = await fetchParticipantRows(
      supabase,
      ctx.accountId,
      input.now ?? new Date(),
    );

    const canInvite = canInviteOrChangeRoles(ctx.role);
    const copy = familyContent.participantes;

    const participants: ParticipantListItem[] = rows.map((row) => {
      const isSelf = row.profileId !== null && row.profileId === ctx.userId;
      const displayEmail =
        isSelf && !row.email ? (ctx.email ?? null) : row.email;

      const isExternalEmergency =
        row.kind === "member" &&
        row.situation === "active" &&
        row.profileId === null &&
        row.role === "emergency_contact";

      return {
        id: row.id,
        kind: row.kind,
        initials: buildAvatarInitials(row.displayName),
        title: buildParticipantTitle({
          displayName: row.displayName,
          relationshipLabel: row.relationshipLabel,
          isSelf,
          selfSuffix: copy.selfSuffix,
        }),
        subtitle: buildParticipantSubtitle({
          email: displayEmail,
          phone: row.phone,
        }),
        roleLabel: getRoleDisplayLabel(row.role),
        situationLabel: resolveSituationDisplay(row.situation).label,
        situationTone: resolveSituationDisplay(row.situation).tone,
        canResend:
          canInvite &&
          row.kind === "invite" &&
          (row.situation === "pending" || row.situation === "expired"),
        inviteId: row.inviteId,
        isSelf,
        emergencyNote: isExternalEmergency ? copy.emergencyPhoneNote : null,
      };
    });

    return {
      ok: true,
      data: {
        participants,
        careRecipientDisplayName: shell.careRecipientDisplayName,
        canInvite,
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        openModal: input.modal === "convite" && canInvite,
        autoEmailSendAvailable: false,
      },
    };
  } catch {
    return {
      ok: false,
      message: familyContent.participantes.loadError,
    };
  }
}
