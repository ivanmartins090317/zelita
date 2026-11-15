export interface LoginEmailStepContent {
  title: string;
  subtitle: string;
  subtitleBold: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitLabel: string;
  submitPendingLabel: string;
  dividerLabel: string;
  signupLabel: string;
  signupHref: string;
  passwordNote: {
    icon: string;
    title: string;
    body: string;
  };
  helpPrompt: string;
  helpLinkLabel: string;
}

export interface LoginCodeStepContent {
  title: string;
  subtitlePrefix: string;
  resendPrefix: string;
  resendActionLabel: string;
  resendPendingLabel: string;
  changeEmailLabel: string;
  submitLabel: string;
  submitPendingLabel: string;
  backLabel: string;
  incompleteCodeError: string;
  pasteLabel: string;
  pasteFailedMessage: string;
}

export interface LoginErrorStepContent {
  title: string;
  subtitle: string;
  alertIcon: string;
  alertTitle: string;
  alertBody: string;
  resendLabel: string;
  resendPendingLabel: string;
  changeEmailLabel: string;
}

export interface LoginPickerStepContent {
  title: string;
  subtitle: string;
  elderNote: {
    icon: string;
    body: string;
    bodyBold: string;
  };
}

export interface LoginHelpStepContent {
  title: string;
  subtitle: string;
  items: Array<{ question: string; answer: string }>;
  backLabel: string;
  supportPrefix: string;
  supportPhone: string;
  supportSuffix: string;
}

export interface LoginMessagesContent {
  emailInvalid: string;
  codeInvalidGeneric: string;
  codeSendSuccess: string;
  codeSendFailure: string;
  verifyFailure: string;
  emailLinkFailure: string;
}

export interface LoginRoleLabels {
  admin: string;
  caregiver: string;
  viewer: string;
  emergency_contact: string;
}

export interface LoginContent {
  email: LoginEmailStepContent;
  code: LoginCodeStepContent;
  error: LoginErrorStepContent;
  picker: LoginPickerStepContent;
  help: LoginHelpStepContent;
  messages: LoginMessagesContent;
  roleLabels: LoginRoleLabels;
  resendCooldownSeconds: number;
}

export const loginRoutes = {
  signup: "/cadastro",
  familia: "/familia",
  onboarding: "/onboarding",
} as const;

export const loginContent: LoginContent = {
  resendCooldownSeconds: 45,
  email: {
    title: "Que bom te ver de novo",
    subtitle:
      "Digite o e-mail da sua conta. A gente manda um código de 6 números e você entra — ",
    subtitleBold: "sem senha para decorar",
    emailLabel: "Seu e-mail",
    emailPlaceholder: "cintia@email.com",
    submitLabel: "Enviar meu código de acesso",
    submitPendingLabel: "Enviando…",
    dividerLabel: "ou",
    signupLabel: "Criar minha conta · 30 dias grátis",
    signupHref: loginRoutes.signup,
    passwordNote: {
      icon: "🔐",
      title: "Por que não pedimos senha?",
      body: "Porque senha esquecida é o motivo número um de gente desistir de um sistema. O código chega no seu e-mail, vale 10 minutos e serve uma vez só — é mais seguro do que a maioria das senhas.",
    },
    helpPrompt: "Problemas para entrar?",
    helpLinkLabel: "Ver as saídas",
  },
  code: {
    title: "Digite o código que enviamos",
    subtitlePrefix: "Olhamos para ",
    resendPrefix: "Enviar de novo em ",
    resendActionLabel: "Enviar de novo",
    resendPendingLabel: "Enviando…",
    changeEmailLabel: "Trocar o e-mail",
    submitLabel: "Entrar",
    submitPendingLabel: "Entrando…",
    backLabel: "Voltar",
    incompleteCodeError:
      "Informe o código completo do e-mail (6 a 8 números).",
    pasteLabel: "Colar código",
    pasteFailedMessage:
      "Não deu para colar. Copie o código no e-mail, toque numa caixinha, segure o dedo e escolha Colar.",
  },
  error: {
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
  picker: {
    title: "Quem você quer acompanhar?",
    subtitle:
      "Você tem acesso a mais de uma pessoa. Escolha uma para abrir — dá para trocar depois a qualquer momento, no alto da barra lateral.",
    elderNote: {
      icon: "👤",
      body: "A pessoa cuidada ",
      bodyBold:
        "nunca faz login. Ela não tem e-mail cadastrado aqui, não recebe código e não cria senha. O acesso dela é o atalho no celular, que abre direto — sem nenhuma tela de entrada.",
    },
  },
  help: {
    title: "Não está conseguindo entrar?",
    subtitle:
      "Estas são as situações mais comuns. Nenhuma delas faz você perder dado nenhum.",
    items: [
      {
        question: "No celular não consigo colar o código",
        answer:
          "Toque em Colar código. Se o celular pedir permissão, permita. Também dá para tocar em Entrar na Zelita dentro do e-mail, sem digitar.",
      },
      {
        question: "O código não chegou",
        answer:
          "Olhe a pasta de spam ou lixo eletrônico. Se não estiver lá, peça um novo depois de 45 segundos — o anterior deixa de valer na hora.",
      },
      {
        question: "Não lembro qual e-mail usei",
        answer:
          "Tente o e-mail em que você recebe os avisos da Zelita. Se ainda não achar, um administrador da conta pode ver a lista em Quem participa e te reenviar o convite.",
      },
      {
        question: "Perdi o acesso ao e-mail antigo",
        answer:
          "Outro administrador da conta troca o seu e-mail em Quem participa. Se você é a única administradora, fale com a gente — vamos pedir uma confirmação de identidade antes de mudar qualquer coisa.",
      },
      {
        question: "Recebi um convite e o link expirou",
        answer:
          "Convite vale 7 dias. Peça para quem convidou clicar em Reenviar — leva um segundo.",
      },
      {
        question: "Minha conta estava pausada",
        answer:
          "Você entra normalmente e vê seus dados. Só o envio de lembretes fica parado até você reativar — e nada foi apagado.",
      },
    ],
    backLabel: "Voltar para o login",
    supportPrefix: "Ainda travado? Chame a gente no WhatsApp ",
    supportPhone: "(11) 90000-0000",
    supportSuffix: " — respondemos de segunda a sábado.",
  },
  messages: {
    emailInvalid: "Informe um e-mail válido.",
    codeInvalidGeneric:
      "Esse código não funcionou. Pode ter expirado ou ter algum número trocado.",
    codeSendSuccess:
      "Código enviado. Olhe seu e-mail — vale cerca de 10 minutos.",
    codeSendFailure:
      "Não conseguimos enviar o código agora. Verifique sua conexão e tente de novo em instantes.",
    verifyFailure:
      "Não foi possível confirmar o código agora. Tente de novo em instantes.",
    emailLinkFailure:
      "Esse link do e-mail não entrou. Copie o código, cole na tela ou peça um código novo.",
  },
  roleLabels: {
    admin: "você é administradora",
    caregiver: "você entrou como cuidadora",
    viewer: "acesso de visualização",
    emergency_contact: "contato de emergência",
  },
};
