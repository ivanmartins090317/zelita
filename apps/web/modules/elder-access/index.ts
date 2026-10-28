/** API pública do módulo `elder-access`. */
export { getElderPreview } from "./application/get-elder-preview";
export { readElderDisplayFromCookie } from "./application/read-elder-display";
export { saveElderDisplayAction } from "./application/save-elder-display";
export { DevicesStubNote } from "./presentation/devices-stub-note";

export const elderAccessModule = {
  id: "elder-access",
} as const;
