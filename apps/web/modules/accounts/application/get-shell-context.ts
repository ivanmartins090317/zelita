import { cookies } from "next/headers";

import { loginContent } from "@/content/login";
import { SELECTED_ACCOUNT_COOKIE } from "@/modules/accounts/application/account-selection";
import {
  listUserMemberships,
  requireUser,
  type AccountMembershipSummary,
} from "@/modules/accounts/application/family-context";
import {
  buildAvatarInitials,
  computeAgeFromBirthDate,
  mapMembershipsToLoginOptions,
  resolveValidSelectedAccountId,
} from "@/modules/accounts/application/login-routing";
import {
  canManageMedications,
  isAccountPaused,
  type AccountStatus,
} from "@/modules/accounts/domain/roles";
import {
  computeTrialDisplay,
  type ShellContext,
  type ShellMembershipOption,
} from "@/modules/accounts/application/shell-context";

function pickMembership(
  memberships: AccountMembershipSummary[],
  savedAccountId: string | null,
): AccountMembershipSummary | null {
  if (memberships.length === 0) return null;

  const accountIds = memberships.map((item) => item.accountId);
  const preferredId = resolveValidSelectedAccountId(
    savedAccountId,
    accountIds,
  );

  if (preferredId) {
    return memberships.find((item) => item.accountId === preferredId) ?? null;
  }

  return memberships[0] ?? null;
}

function mapShellMembershipOptions(
  memberships: AccountMembershipSummary[],
  selectedAccountId: string,
): ShellMembershipOption[] {
  const loginOptions = mapMembershipsToLoginOptions(
    memberships,
    loginContent.roleLabels,
  );

  return loginOptions.map((option) => ({
    accountId: option.accountId,
    displayName: option.displayName,
    subtitle: option.subtitle,
    initials: option.initials,
    isSelected: option.accountId === selectedAccountId,
  }));
}

export async function getShellContext(): Promise<ShellContext | null> {
  const { supabase, user } = await requireUser();
  const cookieStore = await cookies();
  const savedAccountId =
    cookieStore.get(SELECTED_ACCOUNT_COOKIE)?.value ?? null;

  const memberships = await listUserMemberships(supabase, user.id);
  const membership = pickMembership(memberships, savedAccountId);

  if (
    !membership?.accountId ||
    !membership.careRecipientId ||
    !membership.careRecipientDisplayName
  ) {
    return null;
  }

  const { data: account } = await supabase
    .from("accounts")
    .select("plan, trial_ends_at, status")
    .eq("id", membership.accountId)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  const profileName = profile?.full_name ?? null;
  const accountPlan = (account?.plan as string | undefined) ?? "essential";
  const accountStatus =
    (account?.status as AccountStatus | undefined) ??
    membership.accountStatus;
  const trialEndsAt = (account?.trial_ends_at as string | null) ?? null;
  const age = computeAgeFromBirthDate(membership.careRecipientBirthDate);

  return {
    userId: user.id,
    profileName,
    profileInitials: buildAvatarInitials(profileName),
    accountId: membership.accountId,
    role: membership.role,
    accountStatus,
    accountPlan,
    careRecipientId: membership.careRecipientId,
    careRecipientDisplayName: membership.careRecipientDisplayName,
    careRecipientBirthDate: membership.careRecipientBirthDate,
    careRecipientInitials: buildAvatarInitials(
      membership.careRecipientDisplayName,
    ),
    careRecipientAge: age,
    careRecipientRelationship: membership.careRecipientRelationship,
    canManageMedications: canManageMedications(membership.role),
    trial: computeTrialDisplay({
      trialEndsAt,
      plan: accountPlan,
    }),
    isPaused: isAccountPaused(accountStatus),
    memberships: mapShellMembershipOptions(memberships, membership.accountId),
  };
}
