import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

import { Timeline } from "./timeline";

describe("Timeline", () => {
  it("renderiza lista semântica acessível", () => {
    const markup = renderToStaticMarkup(
      <Timeline
        items={[
          {
            id: "1",
            timeLabel: "08:00 · concluído",
            title: "Losartana — lembrete enviado",
            subtitle: "tomada não confirmada",
          },
        ]}
      />,
    );

    expect(markup).toContain('aria-label="Linha do tempo do dia"');
    expect(markup).toContain("Losartana — lembrete enviado");
    expect(markup).toContain("tomada não confirmada");
  });

  it("aplica variante warning sem coral", () => {
    const markup = renderToStaticMarkup(
      <Timeline
        items={[
          {
            id: "w1",
            timeLabel: "alerta",
            title: "Losartana deve acabar",
            variant: "warning",
          },
        ]}
      />,
    );

    expect(markup).toContain("border-amber");
    expect(markup).not.toContain("coral");
  });
});
