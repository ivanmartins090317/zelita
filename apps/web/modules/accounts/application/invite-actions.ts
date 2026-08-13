"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { familyContent, familyRoutes } from "@/content/family";
import { requireAdminForInvites } from "@/modules/accounts/application/family-context";
import { resendInvite } from "@/modules/accounts/application/resend-invite";
import { sendInvite } from "@/modules/accounts/application/send-invite";
import type { AccountRole } from "@/modules/accounts/domain/roles";

export interface InviteActionResult {
  ok: boolean;
  message?: string;
  acceptUrl?: string;
  kind?: "invite" | "immediate_emergency";
}

async function resolveAppBaseUrl(): Promise<string | undefined> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const proto = headerStore.get("x-forwarded-proto") ?? "http";
  if (!host) return process.env.NEXT_PUBLIC_APP_URL;
  return `${proto}://${host}`;
}

export async function sendInviteAction(
  _prev: InviteActionResult,
  formData: FormData,
): Promise<InviteActionResult> {
  try {
    const ctx = await requireAdminForInvites();
    const copy = familyContent.participantes;

    const result = await sendInvite(
      {
        accountId: ctx.accountId!,
        careRecipientId: ctx.careRecipientId,
        invitedBy: ctx.userId,
        displayName: String(formData.get("displayName") ?? ""),
        relationshipLabel: String(formData.get("relationshipLabel") ?? "") || null,
        contactRaw: String(formData.get("contact") ?? ""),
        role: String(formData.get("role") ?? "caregiver") as AccountRole,
        baseUrl: await resolveAppBaseUrl(),
      },
      {
        nameRequired: copy.modal.nameRequired,
        contactInvalid: copy.modal.contactInvalid,
        duplicatePending: copy.modal.duplicatePending,
        duplicateActive: copy.modal.duplicateActive,
      },
    );

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidatePath(familyRoutes.participantes);
    revalidatePath(familyRoutes.hoje);

    if (result.kind === "immediate_emergency") {
      return {
        ok: true,
        kind: "immediate_emergency",
        message: copy.feedback.emergencyActive,
      };
    }

    return {
      ok: true,
      kind: "invite",
      acceptUrl: result.acceptUrl,
      message: copy.feedback.inviteCreated,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.participantes.modal.genericError,
    };
  }
}

export async function resendInviteAction(
  _prev: InviteActionResult,
  formData: FormData,
): Promise<InviteActionResult> {
  try {
    const ctx = await requireAdminForInvites();
    const inviteId = String(formData.get("inviteId") ?? "").trim();
    if (!inviteId) {
      return { ok: false, message: "Convite inválido." };
    }

    const result = await resendInvite({
      accountId: ctx.accountId!,
      inviteId,
      baseUrl: await resolveAppBaseUrl(),
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidatePath(familyRoutes.participantes);
    revalidatePath(familyRoutes.hoje);

    return {
      ok: true,
      kind: "invite",
      acceptUrl: result.acceptUrl,
      message: familyContent.participantes.feedback.inviteResent,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : familyContent.participantes.feedback.resendError,
    };
  }
}
