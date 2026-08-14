import { familyContent, formatTrialBadge } from "@/content/family";
import { getFamilyContext } from "@/modules/accounts/application/family-context";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import {
  ACCOUNT_STATUSES,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import { canViewBilling } from "./can-view-billing";
import { resolveEffectivePlan } from "../domain/effective-plan";
import { resolvePlanSlug } from "../domain/plans";
import { computeTrialBillingCopy } from "../domain/trial-billing-copy";
import {
  formatMembersUsageLine,
  formatStorageUsageLine,
  formatVoiceUsageLine,
  formatWhatsAppUsageLine,
  getMonthBounds,
  isStorageQuotaExceeded,
} from "../domain/usage-formatters";
import {
  countActiveMembersWithLogin,
  countMedicationEventsInRange,
  fetchAccountBillingSnapshot,
  fetchTotalExamBytes,
} from "../infrastructure/billing-read-repo";

export interface PlanoUsageLineViewModel {
  icon: string;
  label: string;
  subtitle: string;
  isOverQuota?: boolean;
}

export interface PlanoPageViewModel {
  careRecipientDisplayName: string;
  planPriceLine: string;
  statusTagLabel: string;
  statusTagTone: "ok" | "info" | "warning" | "muted";
  trialBadge: string | null;
  trialRemainingDays: number | null;
  billingParagraph: string;
  billingParagraphEmphasis: string | null;
  showUnknownPlanNote: boolean;
  elderNote: string;
  showReactivateCta: boolean;
  supportMailto: string;
  isPaused: boolean;
  usageLines: PlanoUsageLineViewModel[];
}

export type PlanoPageResult =
  | { ok: true; data: PlanoPageViewModel }
  | {
      ok: false;
      reason: "forbidden" | "load_failed" | "incomplete";
      message: string;
    };

function buildBillingParagraph(input: {
  copy: typeof familyContent.plano;
  trialCopy: ReturnType<typeof computeTrialBillingCopy>;
  accountStatus: string;
}): { text: string; emphasis: string | null } {
  const { copy, trialCopy, accountStatus } = input;

  if (trialCopy.isTrialActive && trialCopy.firstChargeDateLabel) {
    return {
      text: copy.currentCard.billing.trialChargeTemplate
        .replace("{date}", trialCopy.firstChargeDateLabel)
        .replace("{warningDate}", trialCopy.warningDateLabel ?? "—"),
      emphasis: copy.currentCard.billing.trialChargeEmphasis,
    };
  }

  if (accountStatus === ACCOUNT_STATUSES.paused) {
    return { text: copy.currentCard.billing.pausedBody, emphasis: null };
  }

  if (accountStatus === ACCOUNT_STATUSES.canceled) {
    return { text: copy.currentCard.billing.canceledBody, emphasis: null };
  }

  return { text: copy.currentCard.billing.postTrialActive, emphasis: null };
}

function resolveStatusTag(
  kind: ReturnType<typeof computeTrialBillingCopy>["statusTagKind"],
  copy: typeof familyContent.plano,
): { label: string; tone: "ok" | "info" | "warning" | "muted" } {
  switch (kind) {
    case "trial":
      return { label: copy.currentCard.tags.trial, tone: "info" };
    case "paused":
      return { label: copy.currentCard.tags.paused, tone: "warning" };
    case "canceled":
      return { label: copy.currentCard.tags.canceled, tone: "muted" };
    default:
      return { label: copy.currentCard.tags.active, tone: "ok" };
  }
}

export async function getPlanoPage(input?: {
  now?: Date;
}): Promise<PlanoPageResult> {
  const copy = familyContent.plano;

  try {
    const shell = await getShellContext();
    if (!shell) {
      return { ok: false, reason: "incomplete", message: copy.errors.incomplete };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return { ok: false, reason: "incomplete", message: copy.errors.incomplete };
    }

    if (!canViewBilling(ctx.role)) {
      return { ok: false, reason: "forbidden", message: copy.errors.accessDenied };
    }

    const supabase = await createSupabaseServerClient();
    const account = await fetchAccountBillingSnapshot(supabase, ctx.accountId);

    if (!account) {
      return { ok: false, reason: "load_failed", message: copy.errors.loadFailed };
    }

    const now = input?.now ?? new Date();
    const { slug: planSlug, isUnknown } = resolvePlanSlug(account.plan);
    const effectivePlan = resolveEffectivePlan(account.plan);
    const trialCopy = computeTrialBillingCopy({
      trialEndsAt: account.trialEndsAt,
      plan: account.plan,
      accountStatus: account.status,
      planSlug,
      now,
    });
    const statusTag = resolveStatusTag(trialCopy.statusTagKind, copy);
    const monthBounds = getMonthBounds(now);

    const [whatsappCount, voiceCount, memberCount, storageBytes] =
      await Promise.all([
        countMedicationEventsInRange(
          supabase,
          ctx.careRecipientId,
          "reminder_sent",
          monthBounds.startIso,
          monthBounds.endIso,
        ),
        countMedicationEventsInRange(
          supabase,
          ctx.careRecipientId,
          "voice_fallback",
          monthBounds.startIso,
          monthBounds.endIso,
        ),
        countActiveMembersWithLogin(supabase, ctx.accountId),
        fetchTotalExamBytes(supabase, ctx.careRecipientId),
      ]);

    const usageLines: PlanoUsageLineViewModel[] = [
      {
        icon: "💬",
        label: copy.usageCard.whatsapp.label,
        subtitle: formatWhatsAppUsageLine(
          whatsappCount,
          copy.usageCard.whatsapp.unlimitedSuffix,
        ),
      },
    ];

    if (effectivePlan.hasVoice) {
      usageLines.push({
        icon: "📞",
        label: copy.usageCard.voice.label,
        subtitle: `${formatVoiceUsageLine(voiceCount, copy.usageCard.voice.monthTemplate)} · ${copy.usageCard.voice.hint}`,
      });
    }

    const storageOverQuota = isStorageQuotaExceeded(
      storageBytes,
      effectivePlan.storageQuotaBytes,
    );

    usageLines.push({
      icon: "📄",
      label: copy.usageCard.storage.label,
      subtitle: storageOverQuota
        ? `${formatStorageUsageLine(storageBytes, effectivePlan.storageQuotaBytes)} · ${copy.usageCard.storage.overQuotaHint}`
        : formatStorageUsageLine(storageBytes, effectivePlan.storageQuotaBytes),
      isOverQuota: storageOverQuota,
    });

    usageLines.push({
      icon: "👥",
      label: copy.usageCard.members.label,
      subtitle: formatMembersUsageLine({
        count: memberCount,
        maxMembers: effectivePlan.maxMembersWithLogin,
        unlimitedSuffix: copy.usageCard.members.unlimitedSuffix,
        limitedTemplate: copy.usageCard.members.limitedTemplate,
      }),
    });

    const trialBadge = trialCopy.trialDisplay
      ? formatTrialBadge(
          copy.currentCard.trial.badgeTemplate,
          trialCopy.trialDisplay.currentDay,
          trialCopy.trialDisplay.totalDays,
        )
      : null;

    const billingCopy = buildBillingParagraph({
      copy,
      trialCopy,
      accountStatus: account.status,
    });
    const isPaused = isAccountPaused(account.status);

    return {
      ok: true,
      data: {
        careRecipientDisplayName: shell.careRecipientDisplayName,
        planPriceLine: trialCopy.planPriceLine,
        statusTagLabel: statusTag.label,
        statusTagTone: statusTag.tone,
        trialBadge,
        trialRemainingDays: trialCopy.isTrialActive
          ? trialCopy.remainingDays
          : null,
        billingParagraph: billingCopy.text,
        billingParagraphEmphasis: billingCopy.emphasis,
        showUnknownPlanNote: isUnknown,
        elderNote: copy.currentCard.elderNote.replace(
          "{apelido}",
          shell.careRecipientDisplayName,
        ),
        showReactivateCta: isPaused,
        supportMailto: copy.supportMailto,
        isPaused,
        usageLines,
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
