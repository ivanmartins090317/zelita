import { familyContent, familyRoutes } from "@/content/family";

export type FamilyNavAreaId = keyof typeof familyContent.areas;

export interface FamilyNavItem {
  id: FamilyNavAreaId;
  emoji: string;
  label: string;
  path: string;
}

export interface FamilyNavSection {
  label?: string;
  items: FamilyNavItem[];
}

/** Mapa plano de navegação derivado da copy centralizada. */
export function buildFamilyNavSections(): FamilyNavSection[] {
  return familyContent.nav.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      id: item.id as FamilyNavAreaId,
      emoji: item.emoji,
      label: item.label,
      path: item.path,
    })),
  }));
}

/** Lista plana de todos os destinos do painel. */
export function listFamilyNavItems(): FamilyNavItem[] {
  return buildFamilyNavSections().flatMap((section) => section.items);
}

/** Resolve a área ativa a partir do pathname da rota. */
export function resolveNavAreaFromPath(pathname: string): FamilyNavAreaId {
  const normalized = pathname.replace(/\/$/, "") || "/familia";
  const items = listFamilyNavItems();

  const exact = items.find((item) => item.path === normalized);
  if (exact) return exact.id;

  const prefixMatch = items
    .filter((item) => item.path !== familyRoutes.hoje)
    .find((item) => normalized.startsWith(item.path));

  return prefixMatch?.id ?? "hoje";
}

/** Destaca item ativo — Hoje só em `/familia` exato. */
export function isNavItemActive(pathname: string, itemPath: string): boolean {
  const normalized = pathname.replace(/\/$/, "") || "/familia";

  if (itemPath === familyRoutes.hoje) {
    return normalized === familyRoutes.hoje;
  }

  return normalized === itemPath || normalized.startsWith(`${itemPath}/`);
}

/** Caminhos canônicos exportados para testes e links. */
export const familyNavPaths = Object.values(familyRoutes);
