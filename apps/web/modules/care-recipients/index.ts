import { completeOnboarding, completeSignup } from "./application/complete-onboarding";
import { getAjustesPage } from "./application/get-ajustes-page";
import { updateCareSettingsAction } from "./application/update-care-settings";
import { updateCareRecipientProfileAction } from "./application/update-care-recipient-profile";
import { submitDataSubjectRequestAction } from "./application/submit-data-subject-request";
import {
  canEditCareSettings,
  canViewAjustes,
} from "./application/can-edit-care-settings";
import { readCareChannelForDeviceLink } from "./application/read-channel-for-device-link";

export const careRecipientsModule = {
  id: "care-recipients",
} as const;

export {
  completeOnboarding,
  completeSignup,
  getAjustesPage,
  updateCareSettingsAction,
  updateCareRecipientProfileAction,
  submitDataSubjectRequestAction,
  canEditCareSettings,
  canViewAjustes,
  readCareChannelForDeviceLink,
};
