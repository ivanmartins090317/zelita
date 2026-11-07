export const FAMILY_ROUTE_LOADING_INTERVAL_MS = 2_800;
export const ELDER_ROUTE_LOADING_INTERVAL_MS = 3_200;

export const familyRouteLoadingPhrases = [
  "Estamos carregando suas informações.",
  "Por favor, aguarde um pouco.",
  "Estamos buscando o que você precisa.",
  "Já vai aparecer aqui.",
] as const;

export const elderRouteLoadingPhrases = [
  "Estamos carregando.",
  "Aguarde um pouco.",
  "Já vai aparecer.",
] as const;

export const familyRouteLoadingAnchor = familyRouteLoadingPhrases[0];
export const elderRouteLoadingAnchor = elderRouteLoadingPhrases[0];

export const routeLoadingCopy = {
  family: {
    phrases: familyRouteLoadingPhrases,
    intervalMs: FAMILY_ROUTE_LOADING_INTERVAL_MS,
    anchor: familyRouteLoadingAnchor,
  },
  elder: {
    phrases: elderRouteLoadingPhrases,
    intervalMs: ELDER_ROUTE_LOADING_INTERVAL_MS,
    anchor: elderRouteLoadingAnchor,
  },
} as const;

export type RouteLoadingVariant = keyof typeof routeLoadingCopy;
