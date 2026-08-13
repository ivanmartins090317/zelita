/** API pública do módulo `sos` — F4.7 Pedidos de ajuda. */
export const sosModule = { id: "sos" } as const;

export { getPedidosDeAjudaPage } from "./application/get-pedidos-de-ajuda-page";
export { getHojeSosSnapshot, mergeSosNeedsItems } from "./application/get-hoje-sos-snapshot";
export {
  updateSosEscalationAction,
  resolveSosAlertAction,
} from "./application/sos-actions";
export { canManageSosEscalationForRole as canManageSosEscalation } from "./application/can-manage-sos-escalation";
export { canResolveSosAlertForRole as canResolveSosAlert } from "./application/can-resolve-sos-alert";
export { canViewSosAreaForRole as canViewSosArea } from "./application/can-view-sos-area";
