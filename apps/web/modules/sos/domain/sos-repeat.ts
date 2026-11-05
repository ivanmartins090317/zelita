/** Janela em que um pedido ainda aberto impede outro e impede reenviar o e-mail. */
export const SOS_REPEAT_WINDOW_MS = 2 * 60 * 1000;

/**
 * Segura um pedido novo só quando já existe um pedido aberto da mesma pessoa
 * há menos de 2 minutos. Pedido resolvido não entra: o chamador passa null.
 */
export function shouldHoldOpenSosRepeat(input: {
  now: Date;
  openAlertTriggeredAt: Date | null;
}): boolean {
  if (!input.openAlertTriggeredAt) return false;
  const ageMs = input.now.getTime() - input.openAlertTriggeredAt.getTime();
  if (ageMs < 0) return false;
  return ageMs < SOS_REPEAT_WINDOW_MS;
}
