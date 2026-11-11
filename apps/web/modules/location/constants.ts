/** Constantes do módulo — seguras para import em Client Components. */

export const LOCATION_TIMING = {
  /** Pulso de presença com a aba visível no aparelho. */
  presencePulseMs: 30_000,
  /** Acima disso, o painel trata o aplicativo como fechado. */
  presenceFreshMs: 90_000,
  /** Intervalo mínimo entre pedidos (conta da hora do pedido). */
  requestCooldownMs: 120_000,
  /** Pedido aberto expira após este prazo. */
  requestExpiryMs: 300_000,
  /** Espera máxima por uma leitura nova de GPS no aparelho. */
  gpsWaitMs: 8_000,
} as const;

export const LOCATION_CONSTANTS = {
  homePlaceName: "Casa",
  defaultHomeRadiusM: 150,
  timing: LOCATION_TIMING,
} as const;
