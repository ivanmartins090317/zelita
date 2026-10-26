/** Selo curto do plano no topo da barra. Pausado ganha do nome do plano. */
export function formatSidebarPlanBadge(plan: string, isPaused: boolean): string {
  if (isPaused) return "Pausado";
  if (plan === "cuidado_plus") return "Cuidado+";
  return "Essencial";
}

/** Complemento lido pelo leitor de tela junto com o nome do item. */
export function formatNavCountSuffix(itemId: string, count: number): string {
  if (itemId === "remedios") {
    return count === 1 ? "1 ativo" : `${count} ativos`;
  }
  if (itemId === "avisos") {
    return count === 1 ? "1 em aberto" : `${count} em aberto`;
  }
  return String(count);
}

export function resolveNavBadgeCount(input: {
  itemId: string;
  activeMedicationCount: number;
  openAlertsCount: number;
}): number | null {
  if (input.itemId === "remedios" && input.activeMedicationCount > 0) {
    return input.activeMedicationCount;
  }
  if (input.itemId === "avisos" && input.openAlertsCount > 0) {
    return input.openAlertsCount;
  }
  return null;
}
