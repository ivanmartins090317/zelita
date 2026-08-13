"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { familyContent, familyRoutes } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canManageSafeZones } from "../domain/can-manage-safe-zones";
import { hasConfirmedHomeCoords } from "../domain/home-coords";
import {
  canCreateLocationShare,
  parseLocationShareDuration,
} from "../domain/location-share";
import { isLocationConsentActive } from "../domain/location-consent";
import { LOCATION_CONSTANTS } from "../constants";
import { fetchLatestLocationPoint } from "../infrastructure/location-point-repo";
import {
  deleteSafePlaceRecord,
  fetchSafePlaceById,
  insertSafePlace,
  updateSafePlaceRecord,
} from "../infrastructure/safe-place-repo";
import {
  buildLocationSharePublicPath,
  insertLocationShare,
} from "../infrastructure/location-share-repo";

export interface LocationActionResult {
  ok: boolean;
  message?: string;
  shareUrl?: string;
}

const safePlaceSchema = z.object({
  careRecipientId: z.string().uuid(),
  name: z.string().trim().min(2).max(80),
  addressText: z.string().trim().min(3).max(300),
  radiusM: z.coerce.number().int().min(80).max(200),
  icon: z.string().max(8).optional(),
  alertOnExit: z
    .string()
    .optional()
    .transform((v) => v === "true" || v === "on"),
});

const updatePlaceSchema = safePlaceSchema.extend({
  placeId: z.string().uuid(),
});

const deletePlaceSchema = z.object({
  placeId: z.string().uuid(),
});

const shareSchema = z.object({
  careRecipientId: z.string().uuid(),
  duration: z.string(),
});

function logLocationEvent(
  event: "location_place_created" | "location_share_created",
  payload: Record<string, string>,
) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[location] ${event}`, payload);
  }
}

async function fetchCareRecipientConsent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  careRecipientId: string,
) {
  const { data, error } = await supabase
    .from("care_recipients")
    .select("geo_consent_at, geo_consent_revoked_at")
    .eq("id", careRecipientId)
    .single();

  if (error) throw new Error(error.message);
  return {
    geoConsentAt: (data.geo_consent_at as string | null) ?? null,
    geoConsentRevokedAt: (data.geo_consent_revoked_at as string | null) ?? null,
  };
}

export async function createSafePlaceAction(
  _prev: LocationActionResult,
  formData: FormData,
): Promise<LocationActionResult> {
  const copy = familyContent.localizacao;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.role || !canManageSafeZones(ctx.role)) {
      return { ok: false, message: copy.errors.manageForbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.errors.accountPaused };
    }

    const parsed = safePlaceSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      name: formData.get("name"),
      addressText: formData.get("addressText"),
      radiusM: formData.get("radiusM"),
      icon: formData.get("icon") || undefined,
      alertOnExit: formData.get("alertOnExit") ?? undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidPlace };
    }

    if (parsed.data.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: copy.errors.manageForbidden };
    }

    const supabase = await createSupabaseServerClient();
    const place = await insertSafePlace(supabase, {
      careRecipientId: parsed.data.careRecipientId,
      name: parsed.data.name,
      addressText: parsed.data.addressText,
      radiusM: parsed.data.radiusM,
      icon: parsed.data.icon ?? null,
      alertOnExit: false,
    });

    logLocationEvent("location_place_created", { placeId: place.id });
    revalidatePath(familyRoutes.localizacao);
    revalidatePath(familyRoutes.hoje);
    return { ok: true, message: copy.placeModal.saveSuccess };
  } catch {
    return { ok: false, message: copy.errors.saveFailed };
  }
}

export async function updateSafePlaceAction(
  _prev: LocationActionResult,
  formData: FormData,
): Promise<LocationActionResult> {
  const copy = familyContent.localizacao;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.role || !canManageSafeZones(ctx.role)) {
      return { ok: false, message: copy.errors.manageForbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.errors.accountPaused };
    }

    const parsed = updatePlaceSchema.safeParse({
      placeId: formData.get("placeId"),
      careRecipientId: formData.get("careRecipientId"),
      name: formData.get("name"),
      addressText: formData.get("addressText"),
      radiusM: formData.get("radiusM"),
      icon: formData.get("icon") || undefined,
      alertOnExit: formData.get("alertOnExit") ?? undefined,
    });

    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidPlace };
    }

    const supabase = await createSupabaseServerClient();
    const existing = await fetchSafePlaceById(supabase, parsed.data.placeId);
    if (!existing || existing.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: copy.errors.placeNotFound };
    }

    const wantsAlert = parsed.data.alertOnExit ?? false;
    if (wantsAlert && !hasConfirmedHomeCoords(existing) && !existing.isHome) {
      if (!hasConfirmedHomeCoords(existing)) {
        return { ok: false, message: copy.errors.alertNeedsCoords };
      }
    }

    if (wantsAlert && existing.isHome && !hasConfirmedHomeCoords(existing)) {
      return { ok: false, message: copy.errors.alertNeedsCoords };
    }

    await updateSafePlaceRecord(supabase, parsed.data.placeId, {
      name: parsed.data.name,
      addressText: parsed.data.addressText,
      radiusM: parsed.data.radiusM,
      icon: parsed.data.icon ?? null,
      alertOnExit: wantsAlert,
    });

    revalidatePath(familyRoutes.localizacao);
    revalidatePath(familyRoutes.hoje);
    return { ok: true, message: copy.placeModal.saveSuccess };
  } catch {
    return { ok: false, message: copy.errors.saveFailed };
  }
}

export async function deleteSafePlaceAction(
  _prev: LocationActionResult,
  formData: FormData,
): Promise<LocationActionResult> {
  const copy = familyContent.localizacao;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.role || !canManageSafeZones(ctx.role)) {
      return { ok: false, message: copy.errors.manageForbidden };
    }

    const parsed = deletePlaceSchema.safeParse({
      placeId: formData.get("placeId"),
    });
    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidPlace };
    }

    const supabase = await createSupabaseServerClient();
    const existing = await fetchSafePlaceById(supabase, parsed.data.placeId);
    if (!existing || existing.careRecipientId !== ctx.careRecipientId) {
      return { ok: false, message: copy.errors.placeNotFound };
    }

    if (existing.isHome) {
      return { ok: false, message: copy.errors.cannotDeleteHome };
    }

    await deleteSafePlaceRecord(supabase, parsed.data.placeId);
    revalidatePath(familyRoutes.localizacao);
    return { ok: true, message: copy.placeModal.deleteSuccess };
  } catch {
    return { ok: false, message: copy.errors.saveFailed };
  }
}

export async function createLocationShareAction(
  _prev: LocationActionResult,
  formData: FormData,
): Promise<LocationActionResult> {
  const copy = familyContent.localizacao;

  try {
    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.userId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, message: copy.errors.manageForbidden };
    }
    if (!canManageSafeZones(ctx.role)) {
      return { ok: false, message: copy.errors.shareForbidden };
    }
    if (ctx.accountStatus && isAccountPaused(ctx.accountStatus)) {
      return { ok: false, message: copy.errors.accountPaused };
    }

    const parsed = shareSchema.safeParse({
      careRecipientId: formData.get("careRecipientId"),
      duration: formData.get("duration"),
    });
    if (!parsed.success) {
      return { ok: false, message: copy.errors.invalidShare };
    }

    const duration = parseLocationShareDuration(parsed.data.duration);
    if (!duration) {
      return { ok: false, message: copy.errors.invalidShare };
    }

    const supabase = await createSupabaseServerClient();
    const consent = await fetchCareRecipientConsent(
      supabase,
      ctx.careRecipientId,
    );

    const latest = await fetchLatestLocationPoint(supabase, ctx.careRecipientId);
    const hasPosition = Boolean(
      latest &&
        (latest.lat != null || latest.lng != null || latest.locationText),
    );

    if (
      !canCreateLocationShare({
        consentActive: isLocationConsentActive(consent),
        hasPosition,
      })
    ) {
      return { ok: false, message: copy.errors.shareUnavailable };
    }

    const link = await insertLocationShare(supabase, {
      careRecipientId: ctx.careRecipientId,
      accountId: ctx.accountId,
      createdBy: ctx.userId,
      duration,
    });

    logLocationEvent("location_share_created", { shareId: link.id });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const shareUrl = `${baseUrl}${buildLocationSharePublicPath(link.token)}`;

    revalidatePath(familyRoutes.localizacao);
    return { ok: true, shareUrl, message: copy.shareModal.success };
  } catch {
    return { ok: false, message: copy.errors.saveFailed };
  }
}
