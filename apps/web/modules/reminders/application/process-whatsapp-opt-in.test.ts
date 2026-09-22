import { describe, expect, it } from "vitest";

import { processWhatsAppOptIn } from "./process-whatsapp-opt-in";

function createSupabase(recipients: Array<{ id: string; whatsapp: string }>) {
  return {
    from(table: string) {
      if (table === "care_recipients") {
        return {
          select() {
            return {
              is() {
                return Promise.resolve({ data: recipients, error: null });
              },
            };
          },
          update() {
            return {
              eq() {
                return Promise.resolve({ error: null });
              },
            };
          },
        };
      }
      return {
        insert() {
          return Promise.resolve({ error: null });
        },
      };
    },
  };
}

describe("processWhatsAppOptIn", () => {
  it("grava opt-in quando SIM casa com o WhatsApp cadastrado", async () => {
    const supabase = createSupabase([
      { id: "cr-1", whatsapp: "(11) 97777-4321" },
    ]);
    const result = await processWhatsAppOptIn(supabase as never, {
      text: "SIM.",
      from: "5511977774321",
    });
    expect(result).toEqual({ accepted: true, careRecipientId: "cr-1" });
  });

  it("ignora resposta que não é SIM", async () => {
    const result = await processWhatsAppOptIn(createSupabase([]) as never, {
      text: "nao",
      from: "5511977774321",
    });
    expect(result.accepted).toBe(false);
  });
});
