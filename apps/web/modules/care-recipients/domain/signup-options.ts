/** Parentesco fixo alinhado ao protótipo — slugs estáveis para persistência. */
export const SIGNUP_RELATIONSHIPS = {
  pai: "Pai",
  mae: "Mãe",
  avo_m: "Avô",
  avo_f: "Avó",
  sogro: "Sogro ou sogra",
  outro: "Outro",
} as const;

export type SignupRelationshipSlug =
  (typeof SIGNUP_RELATIONSHIPS)[keyof typeof SIGNUP_RELATIONSHIPS];

export const SIGNUP_RELATIONSHIP_SLUGS = Object.keys(
  SIGNUP_RELATIONSHIPS,
) as Array<keyof typeof SIGNUP_RELATIONSHIPS>;

/** Canais de lembrete — slugs canônicos do PRD. */
export const SIGNUP_CHANNELS = {
  whatsapp: "whatsapp",
  whatsapp_voice: "whatsapp_voice",
  voice_only: "voice_only",
} as const;

export type SignupChannelSlug =
  (typeof SIGNUP_CHANNELS)[keyof typeof SIGNUP_CHANNELS];

export const SIGNUP_CHANNEL_SLUGS = Object.values(SIGNUP_CHANNELS);

/** Tom das mensagens — slugs canônicos. */
export const SIGNUP_TONES = {
  carinhoso: "carinhoso",
  direto: "direto",
  formal: "formal",
} as const;

export type SignupToneSlug = (typeof SIGNUP_TONES)[keyof typeof SIGNUP_TONES];

export const SIGNUP_TONE_SLUGS = Object.values(SIGNUP_TONES);

/** Planos disponíveis no passo 8. */
export const SIGNUP_PLANS = {
  essential: "essential",
  cuidado_plus: "cuidado_plus",
} as const;

export type SignupPlanSlug = (typeof SIGNUP_PLANS)[keyof typeof SIGNUP_PLANS];

export const SIGNUP_PLAN_CHOICES = {
  trial: "trial",
  subscribe: "subscribe",
} as const;

export type SignupPlanChoice =
  (typeof SIGNUP_PLAN_CHOICES)[keyof typeof SIGNUP_PLAN_CHOICES];

/** Papéis exibidos no passo 7 (convite local). */
export const SIGNUP_INVITE_ROLES = {
  admin: "admin",
  caregiver: "caregiver",
  viewer: "viewer",
  emergency_contact: "emergency_contact",
} as const;

export type SignupInviteRoleSlug =
  (typeof SIGNUP_INVITE_ROLES)[keyof typeof SIGNUP_INVITE_ROLES];

export const SIGNUP_INVITE_ROLE_SLUGS = Object.values(SIGNUP_INVITE_ROLES);

export const SIGNUP_TRIAL_DAYS = {
  trial: 30,
  subscribe: 60,
} as const;

export const SIGNUP_DEFAULT_DND = {
  dontBotherBefore: "07:00",
  dontBotherAfter: "22:00",
} as const;

export const SIGNUP_TOTAL_STEPS = 8;
