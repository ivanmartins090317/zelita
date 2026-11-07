import { describe, expect, it } from "vitest";

import {
  ELDER_ROUTE_LOADING_INTERVAL_MS,
  elderRouteLoadingAnchor,
  elderRouteLoadingPhrases,
  FAMILY_ROUTE_LOADING_INTERVAL_MS,
  familyRouteLoadingAnchor,
  familyRouteLoadingPhrases,
  routeLoadingCopy,
} from "./route-loading";

const ENGLISH_LOADING =
  /thinking|processing|analyzing|analysing|computing|almost there|please wait|loading/i;

describe("routeLoadingCopy", () => {
  it("lista quatro frases da família, nesta ordem, com a primeira como âncora", () => {
    expect(familyRouteLoadingPhrases).toEqual([
      "Estamos carregando suas informações.",
      "Por favor, aguarde um pouco.",
      "Estamos buscando o que você precisa.",
      "Já vai aparecer aqui.",
    ]);
    expect(familyRouteLoadingAnchor).toBe(familyRouteLoadingPhrases[0]);
    expect(routeLoadingCopy.family.anchor).toBe(familyRouteLoadingAnchor);
    expect(routeLoadingCopy.family.phrases).toBe(familyRouteLoadingPhrases);
  });

  it("lista três frases do idoso, nesta ordem, com a primeira como âncora", () => {
    expect(elderRouteLoadingPhrases).toEqual([
      "Estamos carregando.",
      "Aguarde um pouco.",
      "Já vai aparecer.",
    ]);
    expect(elderRouteLoadingAnchor).toBe(elderRouteLoadingPhrases[0]);
    expect(routeLoadingCopy.elder.anchor).toBe(elderRouteLoadingAnchor);
    expect(routeLoadingCopy.elder.phrases).toBe(elderRouteLoadingPhrases);
  });

  it("troca a família a cada 2,8 s e o idoso a cada 3,2 s", () => {
    expect(FAMILY_ROUTE_LOADING_INTERVAL_MS).toBe(2_800);
    expect(ELDER_ROUTE_LOADING_INTERVAL_MS).toBe(3_200);
    expect(routeLoadingCopy.family.intervalMs).toBe(2_800);
    expect(routeLoadingCopy.elder.intervalMs).toBe(3_200);
    expect(routeLoadingCopy.family.intervalMs).not.toBe(routeLoadingCopy.elder.intervalMs);
  });

  it("não usa frase em inglês nem dado da conta", () => {
    const phrases = [
      ...familyRouteLoadingPhrases,
      ...elderRouteLoadingPhrases,
    ];

    for (const phrase of phrases) {
      expect(phrase).not.toMatch(ENGLISH_LOADING);
      expect(phrase).not.toMatch(/\d{2,}/);
      expect(phrase.toLowerCase()).not.toMatch(/remédio|telefone|casa|sos/);
    }
  });
});
