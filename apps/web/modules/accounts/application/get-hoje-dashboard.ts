import { loginContent } from "@/content/login";
import { familyContent } from "@/content/family";
import {
  computeOnboardingChecklist,
  isFirstAccessMode,
} from "@/modules/accounts/application/onboarding-checklist";
import {
  countActiveAccountMembers,
  getFamilyContext,
} from "@/modules/accounts/application/family-context";
import {
  canManageMedications,
  isAccountPaused,
} from "@/modules/accounts/domain/roles";
import { getShellContext } from "@/modules/accounts/application/get-shell-context";
import { resolveTrialTotalDays } from "@/modules/accounts/application/shell-context";
import { getHojeMedications } from "@/modules/medications/application/get-hoje-medications";
import { DEFAULT_CARE_TIMEZONE } from "@/modules/medications/domain/hoje-timeline";
import {
  deriveUrgencyLine,
  formatLongDate,
  resolveTimeGreeting,
} from "@/modules/medications/domain/hoje-timeline";
import type { RefillAttentionItem } from "@/modules/medications/infrastructure/medication-read-repo";
import type {
  ActivityFeedItem,
  NextMedicationStat,
  RefillAlertSummary,
  TimelineItem,
} from "@/modules/medications/domain/hoje-timeline";
import type { OnboardingChecklistResult } from "@/modules/accounts/application/onboarding-checklist";
import { isWhatsAppConfigured } from "@/modules/reminders";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface HojeDashboardViewModel {
  mode: "primeiro_acesso" | "hoje_maduro";
  accountId: string;
  profileName: string | null;
  careRecipientDisplayName: string;
  canManageMedications: boolean;
  isPaused: boolean;
  whatsAppDryRun: boolean;
  checklist: OnboardingChecklistResult;
  activeMemberCount: number;
  activeMedicationCount: number;
  greeting: {
    headline: string;
    contextLine: string;
  };
  stats: {
    nextMedication: NextMedicationStat | null;
    refillSummary: RefillAlertSummary;
  } | null;
  timeline: TimelineItem[];
  refillAttention: RefillAttentionItem[];
  activityFeed: ActivityFeedItem[];
  trialDays: number;
}

export type HojeDashboardResult =
  | { ok: true; data: HojeDashboardViewModel }
  | { ok: false; reason: "incomplete" | "forbidden" | "load_failed"; message: string };

function buildWelcomeHeadline(profileName: string | null): string {
  const copy = familyContent.hoje.primeiroAcesso;
  if (profileName) {
    return copy.welcomeNamed.replace("{nome}", profileName);
  }
  return copy.welcomeNeutral;
}

function buildMatureHeadline(profileName: string | null, now: Date): string {
  const greeting = resolveTimeGreeting(now.getHours());
  if (profileName) {
    return `${greeting}, ${profileName}`;
  }
  return greeting;
}

export async function getHojeDashboard(now = new Date()): Promise<HojeDashboardResult> {
  try {
    const shell = await getShellContext();
    if (!shell) {
      return {
        ok: false,
        reason: "incomplete",
        message: "Cadastro incompleto.",
      };
    }

    const ctx = await getFamilyContext();
    if (!ctx.accountId || !ctx.role || !ctx.careRecipientId) {
      return {
        ok: false,
        reason: "incomplete",
        message: "Cadastro incompleto.",
      };
    }

    const timeZone = DEFAULT_CARE_TIMEZONE;
    const supabase = await createSupabaseServerClient();
    const activeMemberCount = await countActiveAccountMembers(
      supabase,
      ctx.accountId,
    );

    const actorProfiles = await supabase
      .from("account_members")
      .select("profile_id, role, profiles(full_name)")
      .eq("account_id", ctx.accountId)
      .eq("status", "active");

    const actorNames = new Map<string, string>();
    const roleLabels = new Map<string, string>();
    for (const row of actorProfiles.data ?? []) {
      const profileId = row.profile_id as string;
      const profile = Array.isArray(row.profiles)
        ? row.profiles[0]
        : row.profiles;
      actorNames.set(profileId, (profile as { full_name?: string })?.full_name ?? "Alguém");
      roleLabels.set(
        profileId,
        loginContent.roleLabels[row.role as keyof typeof loginContent.roleLabels] ??
          "Participante",
      );
    }

    const meds = await getHojeMedications({
      careRecipientId: ctx.careRecipientId,
      timeZone,
      now,
      actorNames,
      roleLabels,
    });

    const checklist = computeOnboardingChecklist({
      activeMedicationCount: meds.activeMedicationCount,
      activeMemberCount,
    });

    const mode = isFirstAccessMode(meds.activeMedicationCount)
      ? "primeiro_acesso"
      : "hoje_maduro";

    const apelido = shell.careRecipientDisplayName;
    const refillCount = meds.refillSummary.count;
    const copy = familyContent.hoje;

    const greeting =
      mode === "primeiro_acesso"
        ? {
            headline: buildWelcomeHeadline(ctx.profileName),
            contextLine: copy.primeiroAcesso.intro.replace("{apelido}", apelido),
          }
        : {
            headline: buildMatureHeadline(ctx.profileName, now),
            contextLine: `${formatLongDate(now, timeZone)} · ${deriveUrgencyLine(
              refillCount,
              apelido,
              copy.maduro.urgencyAlert,
              copy.maduro.urgencyCalm,
            )}`,
          };

    return {
      ok: true,
      data: {
        mode,
        accountId: ctx.accountId,
        profileName: ctx.profileName,
        careRecipientDisplayName: apelido,
        canManageMedications: canManageMedications(ctx.role),
        isPaused: isAccountPaused(ctx.accountStatus ?? "active"),
        whatsAppDryRun: !isWhatsAppConfigured(),
        checklist,
        activeMemberCount,
        activeMedicationCount: meds.activeMedicationCount,
        greeting,
        stats:
          mode === "hoje_maduro"
            ? {
                nextMedication: meds.nextMedication,
                refillSummary: meds.refillSummary,
              }
            : null,
        timeline: meds.timeline,
        refillAttention: meds.refillAttention,
        activityFeed: meds.activityFeed,
        trialDays: shell.trial?.totalDays ?? resolveTrialTotalDays(shell.accountPlan),
      },
    };
  } catch {
    return {
      ok: false,
      reason: "load_failed",
      message:
        "Não foi possível carregar o painel agora. Recarregue a página ou tente de novo em instantes.",
    };
  }
}
