"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { fetchParticipantRows } from "@/modules/accounts/infrastructure/member-list-repo";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageSosEscalationForRole } from "./can-manage-sos-escalation";
import { canResolveSosAlertForRole } from "./can-resolve-sos-alert";
import {
  isDefaultEligibleForEscalation,
  isEligibleForEscalation,
} from "../domain/sos-eligibility";
import {
  normalizeResolutionNote,
  validateResolveSosAlert,
} from "../domain/sos-resolution";
import {
  fetchSosAlertById,
  resolveSosAlertRecord,
} from "../infrastructure/sos-alert-repo";
import { saveSosEscalationOrder } from "../infrastructure/sos-escalation-repo";
import { parseSosAlertStatus } from "../domain/sos-alert-status";

export interface SosActionResult {
  ok: boolean;
  message?: string;
}

const escalationSchema = z.object({
  careRecipientId: z.string().uuid(),
  memberIds: z
    .string()
    .transform((value) =>
      value
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    )
    .pipe(z.array(z.string().uuid()).min(1)),
});

const resolveSchema = z.object({
  alertId: z.string().uuid(),
  resolutionNote: z.string().max(500).optional(),
});

function logSosEvent(
  event: "sos_config_updated" | "sos_resolved",
  payload: Record<string, string>,
) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[sos] ${event}`, payload);
  }
}

export async function updateSosEscalationAction(
  _prev: SosActionResult,
  formData: FormData,
): Promise<SosActionResult> {
  const copy = familyContent.pedidosDeAjuda;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !canManageSosEscalationForRole(ctx.role)) {
      return { ok: false, message: copy.errors.escalationForbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.errors.accountPaused };
    }

    const parsed = escalationSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      memberIds: formData.get("memberIds"),
    });

    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidEscalation };
    }

    if (parsed.data.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: copy.errors.invalidEscalation };
    }

    const supabase = await createSupabaseServerClient();
    const participants = await fetchParticipantRows(supabase, ctx.accountId);
    const activeMembers = participants.filter(
      (row) => row.kind === "member" && row.situation === "active",
    );
    const memberById = new Map(activeMembers.map((row) => [row.id, row]));

    const entries = [];
    let position = 1;

    for (const memberId of parsed.data.memberIds) {
      const member = memberById.get(memberId);
      if (!member) continue;

      const explicitlyIncluded = member.role === "viewer";
      if (!isEligibleForEscalation(member.role, explicitlyIncluded)) {
        if (!isDefaultEligibleForEscalation(member.role)) continue;
      }

      entries.push({
        memberId: member.id,
        profileId: member.profileId,
        role: member.role,
        displayName: member.displayName,
        relationshipLabel: member.relationshipLabel,
        position,
      });
      position += 1;
    }

    if (entries.length === 0) {
      return { ok: false, message: copy.errors.invalidEscalation };
    }

    await saveSosEscalationOrder(supabase, {
      accountId: ctx.accountId,
      careRecipientId: parsed.data.careRecipientId,
      entries,
    });

    logSosEvent("sos_config_updated", {
      accountId: ctx.accountId,
      careRecipientId: parsed.data.careRecipientId,
      contactCount: String(entries.length),
    });

    revalidatePath(familyRoutes.pedidosDeAjuda);
    revalidatePath(familyRoutes.hoje);

    const message =
      entries.length === 1
        ? copy.escalation.singleContactWarning
        : copy.escalation.saveSuccess;

    return { ok: true, message };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[updateSosEscalationAction]", error);
    }
    return { ok: false, message: copy.errors.saveFailed };
  }
}

export async function resolveSosAlertAction(
  _prev: SosActionResult,
  formData: FormData,
): Promise<SosActionResult> {
  const copy = familyContent.pedidosDeAjuda;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !canResolveSosAlertForRole(ctx.role)) {
      return { ok: false, message: copy.errors.resolveForbidden };
    }

    const parsed = resolveSchema.safeParse({
      alertId: formData.get("alertId"),
      resolutionNote: formData.get("resolutionNote") || undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidResolve };
    }

    const supabase = await createSupabaseServerClient();
    const alert = await fetchSosAlertById(supabase, parsed.data.alertId);

    if (!alert || alert.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: copy.errors.alertNotFound };
    }

    const status = parseSosAlertStatus(alert.status);
    if (!status) {
      return { ok: false, message: copy.errors.invalidResolve };
    }

    const validation = validateResolveSosAlert({
      currentStatus: status,
      actorRole: ctx.role,
    });

    if (!validation.ok) {
      if (validation.reason === "already_resolved") {
        const resolver = alert.resolvedBy
          ? (
              await supabase
                .from("profiles")
                .select("full_name")
                .eq("id", alert.resolvedBy)
                .maybeSingle()
            ).data?.full_name ?? "Alguém"
          : "Alguém";
        return {
          ok: false,
          message: copy.errors.alreadyResolved.replace("{nome}", resolver),
        };
      }
      return { ok: false, message: copy.errors.resolveForbidden };
    }

    const note = normalizeResolutionNote(parsed.data.resolutionNote);

    try {
      await resolveSosAlertRecord(supabase, {
        alertId: parsed.data.alertId,
        resolvedBy: ctx.userId,
        resolutionNote: note,
        resolvedAt: new Date().toISOString(),
      });
    } catch (resolveError) {
      if (
        resolveError instanceof Error &&
        resolveError.message === "ALREADY_RESOLVED"
      ) {
        return { ok: false, message: copy.errors.concurrentResolve };
      }
      throw resolveError;
    }

    logSosEvent("sos_resolved", {
      accountId: ctx.accountId,
      alertId: parsed.data.alertId,
    });

    revalidatePath(familyRoutes.pedidosDeAjuda);
    revalidatePath(familyRoutes.hoje);

    return { ok: true, message: copy.resolve.saveSuccess };
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("[resolveSosAlertAction]", error);
    }
    return { ok: false, message: copy.errors.saveFailed };
  }
}
