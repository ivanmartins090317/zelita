/** API pública do módulo `elder-access`. */
export { getElderPreview } from "./application/get-elder-preview";
export { getElderSurface } from "./application/get-elder-surface";
export { getInstallDevicePage, readElderDeviceSubtitle } from "./application/get-install-page";
export { readElderDisplayFromCookie } from "./application/read-elder-display";
export { saveElderDisplayAction } from "./application/save-elder-display";
export {
  confirmElderDeviceAction,
  issueDeviceLinkAction,
  revokeElderDeviceAction,
} from "./application/device-link-actions";

export const elderAccessModule = {
  id: "elder-access",
} as const;
