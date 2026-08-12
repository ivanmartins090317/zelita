import { Inngest } from "inngest";

export const inngest = new Inngest({ id: "zelita" });

export function isInngestConfigured(config?: {
  eventKey?: string;
}): boolean {
  const eventKey = config?.eventKey ?? process.env.INNGEST_EVENT_KEY;
  return Boolean(eventKey);
}
