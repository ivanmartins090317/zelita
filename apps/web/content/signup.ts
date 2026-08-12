export interface SignupShellContent {
  stepCounterPrefix: string;
  stepCounterSuffix: string;
  backLabel: string;
  continueLabel: string;
}

export interface SignupEmailStepContent {
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  submitPendingLabel: string;
  trialNote: {
    icon: string;
    title: string;
    body: string;
  };
}

export interface SignupCodeStepContent {
  title: string;
  subtitlePrefix: string;
  subtitleSuffix: string;
  resendPrefix: string;
  resendActionLabel: string;
  resendPendingLabel: string;
  changeEmailLabel: string;
  submitLabel: string;
  submitPendingLabel: string;
  backLabel: string;
  incompleteCodeError: string;
}

export interface SignupCodeErrorContent {
  title: string;
  subtitle: string;
  alertIcon: string;
  alertTitle: string;
  alertBody: string;
  resendLabel: string;
  resendPendingLabel: string;
  changeEmailLabel: string;
}

export interface SignupManagerStepContent {
  title: string;
  subtitle: string;
  nameLabel: string;
  whatsappLabel: string;
  whatsappHint: string;
}

export interface SignupCareRecipientStepContent {
  title: string;
  subtitle: string;
  fullNameLabel: string;
  displayNameLabel: string;
  displayNameHint: string;
  birthDateLabel: string;
  relationshipLabel: string;
}

export interface SignupContactStepContent {
  title: string;
  titleWithName: string;
  subtitle: string;
  whatsappLabel: string;
  whatsappHint: string;
  addressLabel: string;
  addressHint: string;
}

export interface SignupChannelOptionContent {
  slug: string;
  title: string;
  description: string;
  tag?: { label: string; tone: "ok" | "info" };
}

export interface SignupChannelStepContent {
  title: string;
  subtitle: string;
  toneLabel: string;
  previewLabel: string;
  dndBeforeLabel: string;
  dndAfterLabel: string;
  channels: SignupChannelOptionContent[];
  tones: Array<{ slug: string; label: string }>;
}

export interface SignupInviteStepContent {
  title: string;
  subtitle: string;
  adminSuffix: string;
  adminRoleLabel: string;
  contactLabel: string;
  contactPlaceholder: string;
  inviteLabel: string;
  invitePendingLabel: string;
  rolesHint: string;
  skipLabel: string;
  roles: Array<{ slug: string; label: string }>;
}

export interface SignupPlanOptionContent {
  slug: string;
  title: string;
  tag: { label: string; tone: "ok" | "info" };
  price: string;
  priceSuffix: string;
  bullets: string[];
}

export interface SignupPlanStepContent {
  title: string;
  subtitle: string;
  elderNote: {
    icon: string;
    title: string;
    body: string;
  };
  securityNote: {
    icon: string;
    body: string;
  };
  trialCta: string;
  trialCtaPending: string;
  subscribeCta: string;
  subscribeCtaDisabled: string;
  subscribeCtaPending: string;
  options: SignupPlanOptionContent[];
}

export interface SignupValidationContent {
  emailInvalid: string;
  managerNameRequired: string;
  phoneInvalid: string;
  careFullNameRequired: string;
  careDisplayNameRequired: string;
  birthDateInvalid: string;
  relationshipInvalid: string;
  addressRequired: string;
  channelInvalid: string;
  toneInvalid: string;
  planInvalid: string;
  inviteContactInvalid: string;
  sessionRequired: string;
}

export interface SignupMessagesContent {
  codeSendFailure: string;
  codeInvalidGeneric: string;
  persistFailure: string;
}

export interface SignupContent {
  shell: SignupShellContent;
  email: SignupEmailStepContent;
  code: SignupCodeStepContent;
  codeError: SignupCodeErrorContent;
  manager: SignupManagerStepContent;
  careRecipient: SignupCareRecipientStepContent;
  contact: SignupContactStepContent;
  channel: SignupChannelStepContent;
  invites: SignupInviteStepContent;
  plan: SignupPlanStepContent;
  validation: SignupValidationContent;
  messages: SignupMessagesContent;
  resendCooldownSeconds: number;
}

export const signupRoutes = {
  cadastro: "/cadastro",
  onboarding: "/onboarding",
  familia: "/familia",
  entrar: "/entrar",
  stepNames: [
    "Seu e-mail",
    "Confirmar o código",
    "Seus dados",
    "Quem você cuida",
    "WhatsApp e endereço dele",
    "Como falamos com ele",
    "Quem mais participa (opcional)",
    "Como você quer começar",
  ],
} as const;

export const signupContent: SignupContent = {
  resendCooldownSeconds: 45,
  shell: {
    stepCounterPrefix: "Passo",
    stepCounterSuffix: "de 8",
    backLabel: "Voltar",
    continueLabel: "Continuar",
  },
  email: {
    title: "Qual é o seu e-mail?",
    subtitle:
      "Só isso por agora. Você não vai criar senha nenhuma — a gente manda um código de 6 números.",
    emailLabel: "Seu e-mail",
    emailPlaceholder: "cintia@email.com",
    submitLabel: "Enviar meu código",
    submitPendingLabel: "Enviando…",
    trialNote: {
      icon: "🎁",
      title: "Os primeiros 30 dias são grátis",
      body: " e não pedimos cartão de crédito agora. Você escolhe como quer pagar no último passo — e uma das opções é não pagar nada ainda.",
    },
  },
  code: {
    title: "Digite o código que enviamos",
    subtitlePrefix: "Olhe a caixa de entrada de ",
    subtitleSuffix:
      ". O código chega em segundos e vale por 10 minutos.",
    resendPrefix: "Enviar de novo em ",
    resendActionLabel: "Enviar de novo",
    resendPendingLabel: "Enviando…",
    changeEmailLabel: "Trocar o e-mail",
    submitLabel: "Confirmar",
    submitPendingLabel: "Confirmando…",
    backLabel: "Voltar",
    incompleteCodeError:
      "Informe o código completo do e-mail (6 a 8 números).",
  },
  codeError: {
    title: "Esse código não funcionou",
    subtitle:
      "Pode ter expirado, ou um número saiu trocado. Nada foi perdido — vamos mandar outro.",
    alertIcon: "⚠️",
    alertTitle: "Código incorreto ou expirado.",
    alertBody:
      "Confira os números ou peça um código novo. Se precisar, troque o e-mail.",
    resendLabel: "Enviar um código novo",
    resendPendingLabel: "Enviando…",
    changeEmailLabel: "Usar outro e-mail",
  },
  manager: {
    title: "Como podemos te chamar?",
    subtitle:
      "Seu nome aparece nas mensagens que a Zelita manda para a pessoa cuidada — por exemplo: “qualquer coisa é só chamar a Cintia”.",
    nameLabel: "Seu nome",
    whatsappLabel: "Seu celular (WhatsApp)",
    whatsappHint:
      "É por aqui que você recebe um pedido de ajuda. É o único aviso que ignora horário de silêncio.",
  },
  careRecipient: {
    title: "De quem você cuida?",
    subtitle:
      "Ele ou ela não vai instalar aplicativo nenhum, nem criar conta. Todo o contato acontece pelo WhatsApp de sempre.",
    fullNameLabel: "Nome completo",
    displayNameLabel: "Como a Zelita vai chamar",
    displayNameHint: "Use o mesmo jeito que a família chama.",
    birthDateLabel: "Data de nascimento",
    relationshipLabel: "É seu…",
  },
  contact: {
    title: "O WhatsApp e a casa",
    titleWithName: "O WhatsApp e a casa do {name}",
    subtitle: "Duas informações e acabou a parte de cadastro.",
    whatsappLabel: "WhatsApp dele(a)",
    whatsappHint:
      "Antes de qualquer lembrete, a Zelita manda uma mensagem se apresentando e pedindo autorização. Nada é enviado sem ele aceitar.",
    addressLabel: "Endereço de casa",
    addressHint:
      "Serve para o pedido de ajuda saber onde ele mora, e vira o primeiro “lugar de sempre”.",
  },
  channel: {
    title: "Como a Zelita vai falar com ele(a)",
    subtitle:
      "O tom importa mais que a tecnologia. Nada de mensagem que pareça cobrança ou vigilância.",
    toneLabel: "Tom das mensagens",
    previewLabel: "Prévia da mensagem",
    dndBeforeLabel: "Não incomodar antes de",
    dndAfterLabel: "Não incomodar depois de",
    channels: [
      {
        slug: "whatsapp",
        title: "Só WhatsApp",
        description:
          "Mensagem escrita no horário do remédio, com opção de áudio gravado na voz da família.",
        tag: { label: "Recomendado", tone: "ok" },
      },
      {
        slug: "whatsapp_voice",
        title: "WhatsApp e, se não ler, ligação",
        description:
          "Para quem tem pouca familiaridade com celular ou toma remédio crítico: sem leitura em 20 minutos, a Zelita liga.",
        tag: { label: "Cuidado+", tone: "info" },
      },
      {
        slug: "voice_only",
        title: "Só ligação",
        description: "Para quem não usa WhatsApp.",
      },
    ],
    tones: [
      { slug: "carinhoso", label: "Carinhoso" },
      { slug: "direto", label: "Direto e curto" },
      { slug: "formal", label: "Formal" },
    ],
  },
  invites: {
    title: "Quem mais participa do cuidado?",
    subtitle:
      "Este passo é opcional — mas quanto antes seus irmãos entrarem, menos coisa sobra para você. Cada pessoa enxerga só o que você permitir.",
    adminSuffix: " (você)",
    adminRoleLabel: "Administradora",
    contactLabel: "Convidar por e-mail ou WhatsApp",
    contactPlaceholder: "nome@email.com ou (11) 90000-0000",
    inviteLabel: "Convidar",
    invitePendingLabel: "Adicionando…",
    rolesHint:
      "Administrador edita tudo · Cuidador acompanha e registra · Visualizador só olha · Contato de emergência recebe o pedido de ajuda",
    skipLabel: "Fazer isso depois",
    roles: [
      { slug: "admin", label: "Administrador" },
      { slug: "caregiver", label: "Cuidador" },
      { slug: "viewer", label: "Visualizador" },
      { slug: "emergency_contact", label: "Contato de emergência" },
    ],
  },
  plan: {
    title: "Última coisa: como você quer começar?",
    subtitle:
      "As duas opções liberam o produto completo agora. A diferença é só quando você paga.",
    elderNote: {
      icon: "💡",
      title: "Em qualquer uma das duas, a pessoa cuidada nunca vê cobrança.",
      body: " Ela não recebe fatura, anúncio nem pedido de cartão em nenhuma mensagem. Se ela receber algo assim, não é a Zelita.",
    },
    securityNote: {
      icon: "🔒",
      body: "Nesta etapa o pagamento é feito na página segura do nosso provedor. A Zelita nunca guarda o número do seu cartão, e você não digita dado de cartão dentro do nosso site.",
    },
    trialCta: "Começar meus 30 dias grátis",
    trialCtaPending: "Criando sua conta…",
    subscribeCta: "Ir para pagamento seguro",
    subscribeCtaDisabled: "Pagamento em breve — salve sua conta agora",
    subscribeCtaPending: "Criando sua conta…",
    options: [
      {
        slug: "trial",
        title: "Testar 30 dias de graça",
        tag: { label: "Mais escolhido", tone: "ok" },
        price: "R$ 0",
        priceSuffix: "pelos primeiros 30 dias",
        bullets: [
          "Não pedimos cartão de crédito agora",
          "Produto completo liberado, sem função bloqueada",
          "Avisamos 5 dias antes de acabar",
          "No fim, se você não responder, a conta pausa — não cobramos automaticamente",
        ],
      },
      {
        slug: "subscribe",
        title: "Assinar agora",
        tag: { label: "2 meses de bônus", tone: "info" },
        price: "R$ 69",
        priceSuffix: "por mês, no plano Cuidado+",
        bullets: [
          "Os 30 dias grátis continuam valendo — a cobrança só começa depois",
          "Mais 1 mês de bônus por assinar já: 60 dias sem pagar",
          "Cancele quando quiser, em dois cliques",
        ],
      },
    ],
  },
  validation: {
    emailInvalid: "Informe um e-mail válido.",
    managerNameRequired: "Informe seu nome (mínimo 2 caracteres).",
    phoneInvalid: "Informe um celular válido com DDD.",
    careFullNameRequired: "Informe o nome completo da pessoa cuidada.",
    careDisplayNameRequired: "Informe como chamar a pessoa cuidada.",
    birthDateInvalid: "Informe a data de nascimento.",
    relationshipInvalid: "Escolha o parentesco.",
    addressRequired: "Informe o endereço de casa (mínimo 5 caracteres).",
    channelInvalid: "Escolha um canal válido.",
    toneInvalid: "Escolha um tom válido.",
    planInvalid: "Escolha como quer começar.",
    inviteContactInvalid:
      "Informe um e-mail válido ou WhatsApp com DDD para convidar.",
    sessionRequired:
      "Confirme seu e-mail com o código antes de continuar o cadastro.",
  },
  messages: {
    codeSendFailure:
      "Não conseguimos enviar o código agora. Verifique sua conexão e tente de novo em instantes.",
    codeInvalidGeneric:
      "Esse código não funcionou. Pode ter expirado ou ter algum número trocado.",
    persistFailure:
      "Não conseguimos concluir o cadastro agora. Verifique sua conexão e tente de novo.",
  },
};
