import { familyContent } from "@/content/family";
import { formatPhoneBR } from "@/lib/format";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { isAccountPaused } from "@/modules/accounts/domain/roles";
import { DEFAULT_CARE_TIMEZONE } from "@/modules/medications/domain/hoje-timeline";
import { fetchMedicationPreviewSamples } from "@/modules/medications/infrastructure/medication-preview-read";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import {
  canEditCareSettings,
  canViewAjustes,
} from "./can-edit-care-settings";
import { formatCareRecipientBirthDisplay } from "../domain/care-recipient-age";
import {
  resolveGeoConsentDisplayStatus,
  resolveVoiceChannelStatus,
  resolveWaOptInStatus,
  shouldShowVoiceChannelLine,
} from "../domain/care-settings-labels";
import {
  buildReminderPreviewWithMedication,
  pickFirstMedicationForPreview,
} from "../domain/message-preview-with-medication";
import { mapDndFromPersistence } from "../domain/message-preview";
import {
  type SignupChannelSlug,
  type SignupToneSlug,
} from "../domain/signup-options";
import { fetchCareRecipientSettings } from "../infrastructure/care-recipient-settings-repo";

export type {
  AjustesChannelViewModel,
  AjustesPageResult,
  AjustesPageViewModel,
  AjustesPrivacyViewModel,
  AjustesRecipientField,
  AjustesToneViewModel,
} from "./ajustes-view-models";
import type { AjustesPageResult } from "./ajustes-view-models";

function formatConsentDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

export async function getAjustesPage(input?: {
  now?: Date;
}): Promise<AjustesPageResult> {
  const copy = familyContent.ajustes;

  try {
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, reason: "forbidden", message: copy.errors.incomplete };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, reason: "forbidden", message: copy.errors.incomplete };
    }
    if (!canViewAjustes(ctx.role)) {
      return { ok: false, reason: "forbidden", message: copy.errors.accessDenied };
    }

    const supabase = await createSupabaseServerClient();
    const recipient = await fetchCareRecipientSettings(
      supabase,
      ctx.careRecipientId,
    );

    if (!recipient) {
      return { ok: false, reason: "load_failed", message: copy.errors.loadFailed };
    }

    const now = input?.now ?? new Date();
    const canEdit = canEditCareSettings(ctx.role);
    const isPaused = isAccountPaused(ctx.accountStatus ?? "active");
    const managerName = ctx.profileName ?? "";
    const dnd = mapDndFromPersistence({
      dndStart: recipient.dnd_start,
      dndEnd: recipient.dnd_end,
    });

    const medications = await fetchMedicationPreviewSamples(
      supabase,
      ctx.careRecipientId,
      now,
      DEFAULT_CARE_TIMEZONE,
    );
    const medicationSample = pickFirstMedicationForPreview(medications);
    const tone = recipient.tone as SignupToneSlug;
    const previewText = buildReminderPreviewWithMedication({
      tone,
      careDisplayName: recipient.display_name,
      managerName,
      medication: medicationSample,
    });

    const waOptInStatus = resolveWaOptInStatus(recipient.wa_opt_in_at);
    const waOptInDateLabel = recipient.wa_opt_in_at
      ? formatConsentDate(recipient.wa_opt_in_at)
      : null;
    const geoStatus = resolveGeoConsentDisplayStatus({
      geoConsentAt: recipient.geo_consent_at,
      geoConsentRevokedAt: recipient.geo_consent_revoked_at,
    });
    const geoConsentDateLabel = recipient.geo_consent_at
      ? formatConsentDate(recipient.geo_consent_at)
      : null;

    const birthDisplay = formatCareRecipientBirthDisplay({
      birthDate: recipient.birth_date,
      now,
    });
    const birthValue = birthDisplay.ageLabel
      ? `${birthDisplay.birthDateLabel} — ${birthDisplay.ageLabel}`
      : birthDisplay.birthDateLabel;

    return {
      ok: true,
      data: {
        careRecipientId: recipient.id,
        careDisplayName: recipient.display_name,
        managerName,
        canEdit,
        isPaused,
        readOnlyNote: canEdit ? null : copy.readOnlyNote,
        channels: {
          waOptInStatus,
          waOptInDateLabel,
          voiceStatus: resolveVoiceChannelStatus(
            recipient.channel_preference as SignupChannelSlug,
          ),
          showVoiceLine: shouldShowVoiceChannelLine(
            recipient.channel_preference as SignupChannelSlug,
          ),
          channelPreference: recipient.channel_preference as SignupChannelSlug,
          channelOptions: copy.channels.options.map((option) => ({
            slug: option.slug as SignupChannelSlug,
            title: option.title,
            description: option.description,
          })),
        },
        tone: {
          tone,
          dontBotherBefore: dnd.dontBotherBefore,
          dontBotherAfter: dnd.dontBotherAfter,
          previewTime: medicationSample?.time ?? null,
          previewText,
          previewHasMedication: medicationSample != null,
          medicationSample,
          toneOptions: copy.tone.tones.map((option) => ({
            slug: option.slug as SignupToneSlug,
            label: option.label,
          })),
        },
        privacy: {
          waOptInStatus,
          waOptInDateLabel,
          geoStatus,
          geoConsentDateLabel,
        },
        recipientFields: [
          { label: copy.recipient.fields.fullName, value: recipient.full_name },
          {
            label: copy.recipient.fields.displayName,
            value: recipient.display_name,
          },
          { label: copy.recipient.fields.birthDate, value: birthValue },
          {
            label: copy.recipient.fields.whatsapp,
            value: recipient.whatsapp
              ? formatPhoneBR(recipient.whatsapp)
              : "—",
          },
          {
            label: copy.recipient.fields.address,
            value: recipient.address_text ?? "—",
          },
        ],
        recipientEditDefaults: {
          fullName: recipient.full_name,
          displayName: recipient.display_name,
          birthDate: recipient.birth_date ?? "",
          whatsapp: recipient.whatsapp ?? "",
          addressText: recipient.address_text ?? "",
        },
      },
    };
  } catch {
    return {
      ok: false,
      reason: "load_failed",
      message: copy.errors.loadFailed,
    };
  }
}

