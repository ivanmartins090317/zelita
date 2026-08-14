import {
  LOCATION_CONSENT_STATUS,
  VOICE_CHANNEL_STATUS,
  WA_OPT_IN_STATUS,
} from "@/modules/care-recipients/domain/care-settings-labels";
import type {
  SignupChannelSlug,
  SignupToneSlug,
} from "@/modules/care-recipients/domain/signup-options";

export interface AjustesChannelViewModel {
  waOptInStatus: (typeof WA_OPT_IN_STATUS)[keyof typeof WA_OPT_IN_STATUS];
  waOptInDateLabel: string | null;
  voiceStatus: (typeof VOICE_CHANNEL_STATUS)[keyof typeof VOICE_CHANNEL_STATUS];
  showVoiceLine: boolean;
  channelPreference: SignupChannelSlug;
  channelOptions: Array<{
    slug: SignupChannelSlug;
    title: string;
    description: string;
  }>;
}

export interface AjustesToneViewModel {
  tone: SignupToneSlug;
  dontBotherBefore: string;
  dontBotherAfter: string;
  previewTime: string | null;
  previewText: string;
  previewHasMedication: boolean;
  medicationSample: {
    time: string;
    medicationName: string;
    dosageLabel: string;
  } | null;
  toneOptions: Array<{ slug: SignupToneSlug; label: string }>;
}

export interface AjustesPrivacyViewModel {
  waOptInStatus: (typeof WA_OPT_IN_STATUS)[keyof typeof WA_OPT_IN_STATUS];
  waOptInDateLabel: string | null;
  geoStatus: (typeof LOCATION_CONSENT_STATUS)[keyof typeof LOCATION_CONSENT_STATUS];
  geoConsentDateLabel: string | null;
}

export interface AjustesRecipientField {
  label: string;
  value: string;
}

export interface AjustesPageViewModel {
  careRecipientId: string;
  careDisplayName: string;
  managerName: string;
  canEdit: boolean;
  isPaused: boolean;
  readOnlyNote: string | null;
  channels: AjustesChannelViewModel;
  tone: AjustesToneViewModel;
  privacy: AjustesPrivacyViewModel;
  recipientFields: AjustesRecipientField[];
  recipientEditDefaults: {
    fullName: string;
    displayName: string;
    birthDate: string;
    whatsapp: string;
    addressText: string;
  };
}

export type AjustesPageResult =
  | { ok: true; data: AjustesPageViewModel }
  | { ok: false; reason: "forbidden" | "load_failed"; message: string };
