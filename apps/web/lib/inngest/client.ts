/**
 * Stub do cliente Inngest.
 * Sem env, jobs não disparam — fatias futuras registram functions reais.
 */
export interface InngestStubConfig {
  eventKey?: string;
}

export function isInngestConfigured(
  config: InngestStubConfig = {
    eventKey: process.env.INNGEST_EVENT_KEY,
  },
): boolean {
  return Boolean(config.eventKey);
}

export function getInngestStubStatus(): "ready" | "unconfigured" {
  return isInngestConfigured() ? "ready" : "unconfigured";
}
