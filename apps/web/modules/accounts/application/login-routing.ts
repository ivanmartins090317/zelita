import type { AccountRole } from "@/modules/accounts/domain/roles";
import type { LoginContent } from "@/content/login";
import { signupRoutes } from "@/content/signup";

export interface AccountRouteSnapshot {
  accountId: string;
  careRecipientId: string | null;
}

export interface LoginAccountOption {
  accountId: string;
  displayName: string;
  subtitle: string;
  initials: string;
}

export interface MembershipDisplaySnapshot {
  accountId: string;
  role: AccountRole;
  careRecipientDisplayName: string | null;
  careRecipientRelationship: string | null;
  careRecipientBirthDate: string | null;
}

export type PostLoginRouteKind = "onboarding" | "familia" | "picker";

export interface PostLoginRoute {
  kind: PostLoginRouteKind;
  accountId: string | null;
}

/** Conta pronta quando existe pessoa cuidada vinculada. */
export function isAccountOnboardingComplete(
  account: AccountRouteSnapshot,
): boolean {
  return Boolean(account.accountId && account.careRecipientId);
}

/** Escolhe a conta salva se ainda pertence ao usuário; senão null. */
export function resolveValidSelectedAccountId(
  savedAccountId: string | null | undefined,
  membershipAccountIds: string[],
): string | null {
  if (!savedAccountId) return null;
  return membershipAccountIds.includes(savedAccountId) ? savedAccountId : null;
}

/**
 * Define para onde ir após autenticar: começar, painel ou seletor de contas.
 * Com preferência válida e uma ou várias contas, usa a preferida.
 */
export function resolvePostLoginRoute(
  memberships: AccountRouteSnapshot[],
  savedAccountId: string | null | undefined,
): PostLoginRoute {
  if (memberships.length === 0) {
    return { kind: "onboarding", accountId: null };
  }

  const accountIds = memberships.map((item) => item.accountId);
  const preferredId = resolveValidSelectedAccountId(
    savedAccountId,
    accountIds,
  );

  if (memberships.length === 1) {
    const only = memberships[0];
    return {
      kind: isAccountOnboardingComplete(only) ? "familia" : "onboarding",
      accountId: only.accountId,
    };
  }

  if (!preferredId) {
    return { kind: "picker", accountId: null };
  }

  const selected = memberships.find((item) => item.accountId === preferredId);
  if (!selected) {
    return { kind: "picker", accountId: null };
  }

  return {
    kind: isAccountOnboardingComplete(selected) ? "familia" : "onboarding",
    accountId: selected.accountId,
  };
}

/** Contagem regressiva do reenvio: `0:45`, `0:07`, etc. */
export function formatResendCountdown(secondsRemaining: number): string {
  const safe = Math.max(0, Math.floor(secondsRemaining));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** Segundos restantes até liberar reenvio, dado o instante do último envio. */
export function computeResendSecondsRemaining(
  sentAtMs: number,
  cooldownSeconds: number,
  nowMs: number = Date.now(),
): number {
  const elapsed = Math.floor((nowMs - sentAtMs) / 1000);
  return Math.max(0, cooldownSeconds - elapsed);
}

/** Iniciais para avatar (até 2 letras). */
export function buildAvatarInitials(name: string | null | undefined): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

/** Idade aproximada a partir de data ISO `YYYY-MM-DD`. */
export function computeAgeFromBirthDate(
  birthDate: string | null | undefined,
  today: Date = new Date(),
): number | null {
  if (!birthDate) return null;
  const parsed = new Date(`${birthDate}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  let age = today.getFullYear() - parsed.getFullYear();
  const monthDiff = today.getMonth() - parsed.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < parsed.getDate())
  ) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

/** Linha descritiva da pessoa cuidada no seletor. */
export function formatCareRecipientSubtitle(input: {
  relationship: string | null;
  age: number | null;
  roleLabel: string;
}): string {
  const parts: string[] = [];
  if (input.relationship) parts.push(input.relationship);
  if (input.age != null) parts.push(`${input.age} anos`);
  parts.push(input.roleLabel);
  return parts.join(" · ");
}

/** Caminho de redirect após escolher conta ou login direto. */
export function destinationPathForRoute(route: PostLoginRoute): string {
  if (route.kind === "familia") return "/familia";
  if (route.kind === "onboarding") return signupRoutes.cadastro;
  return "/entrar";
}

/** Opções do seletor de conta a partir das memberships ativas. */
export function mapMembershipsToLoginOptions(
  memberships: MembershipDisplaySnapshot[],
  roleLabels: LoginContent["roleLabels"],
): LoginAccountOption[] {
  return memberships.map((membership) => {
    const age = computeAgeFromBirthDate(membership.careRecipientBirthDate);
    const roleLabel = roleLabels[membership.role];
    return {
      accountId: membership.accountId,
      displayName: membership.careRecipientDisplayName ?? "Conta familiar",
      subtitle: formatCareRecipientSubtitle({
        relationship: membership.careRecipientRelationship,
        age,
        roleLabel,
      }),
      initials: buildAvatarInitials(membership.careRecipientDisplayName),
    };
  });
}
