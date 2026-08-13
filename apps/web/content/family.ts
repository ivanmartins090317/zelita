export interface FamilyNavItemContent {
  id: string;
  emoji: string;
  label: string;
  path: string;
}

export interface FamilyNavSectionContent {
  label?: string;
  items: FamilyNavItemContent[];
}

export interface FamilyAreaCopy {
  title: string;
  subtitle: string;
}

export interface FamilyPlaceholderContent {
  icon: string;
  title: string;
  description: string;
}

export interface FamilyContent {
  brand: {
    name: string;
  };
  recipientPicker: {
    switchLabel: string;
    ageUnknown: string;
    modalTitle: string;
    closeLabel: string;
    selectedTag: string;
    addAnotherTitle: string;
    addAnotherSubtitle: string;
    switchError: string;
  };
  topbar: {
    tourLabel: string;
    addMedicationLabel: string;
    addExamLabel: string;
    signOutLabel: string;
  };
  trialBar: {
    badgeTemplate: string;
    body: string;
    bodyBold: string;
    bodySuffix: string;
    ctaLabel: string;
  };
  pausedBanner: {
    pausedTitle: string;
    pausedBody: string;
    canceledTitle: string;
    canceledBody: string;
    ctaLabel: string;
  };
  nav: FamilyNavSectionContent[];
  areas: Record<string, FamilyAreaCopy>;
  placeholders: Record<string, FamilyPlaceholderContent>;
  guia: {
    tourNote: string;
  };
  ajustes: {
    signOutDescription: string;
  };
  planLabels: Record<string, string>;
  mobileNav: {
    openLabel: string;
    closeLabel: string;
  };
  hoje: FamilyHojeContent;
  remedios: FamilyRemediosContent;
  consultas: FamilyConsultasContent;
  participantes: FamilyParticipantesContent;
}

export interface FamilyConsultasContent {
  loadError: string;
  weekGrid: {
    titleTemplate: string;
    timeColumn: string;
    prevWeek: string;
    nextWeek: string;
    emptyCell: string;
  };
  list: {
    appointmentsTitle: string;
    tasksTitle: string;
    addButton: string;
    todayLabel: string;
    companionTag: string;
    appointmentsEmpty: {
      icon: string;
      title: string;
      description: string;
    };
    tasksEmpty: {
      icon: string;
      title: string;
      description: string;
    };
    completedSection: string;
  };
  tasks: {
    assignedToYou: string;
    assignedToTemplate: string;
    anyoneLabel: string;
    untilTemplate: string;
    metaSeparator: string;
    completeButton: string;
    reopenButton: string;
    editButton: string;
  };
  appointmentModal: {
    newTitle: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    specialtyLabel: string;
    specialtyPlaceholder: string;
    typeLabel: string;
    dateLabel: string;
    timeLabel: string;
    timeOtherLabel: string;
    datetimeLabel: string;
    locationLabel: string;
    locationPlaceholder: string;
    companionLabel: string;
    companionNone: string;
    preparationLabel: string;
    preparationPlaceholder: string;
    cancel: string;
    save: string;
    saving: string;
    cancelAppointment: string;
    types: Array<{ slug: string; label: string }>;
  };
  taskModal: {
    newTitle: string;
    editTitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    typeLabel: string;
    dueLabel: string;
    assigneeLabel: string;
    assigneeNone: string;
    linkAppointmentLabel: string;
    linkAppointmentNone: string;
    cancel: string;
    save: string;
    saving: string;
    types: Array<{ slug: string; label: string }>;
  };
  feedback: {
    appointmentSaved: string;
    appointmentCancelled: string;
    taskSaved: string;
    taskCompleted: string;
    taskReopened: string;
  };
  errors: {
    titleRequired: string;
    datetimeRequired: string;
    datetimeInvalid: string;
    taskTitleRequired: string;
    invalidCompanion: string;
    invalidLinkedAppointment: string;
    noPermission: string;
    paused: string;
    generic: string;
  };
}

export interface FamilyRemediosContent {
  loadError: string;
  refillBanner: {
    title: string;
    body: string;
  };
  listCard: {
    title: string;
    addButton: string;
    detailButton: string;
  };
  listTags: {
    asNeeded: string;
    noSchedule: string;
    warnDays: string;
    okDays: string;
    noReminder: string;
  };
  empty: {
    icon: string;
    title: string;
    description: string;
    cta: string;
  };
  detail: {
    titleSuffix: string;
    stats: {
      quantityLabel: string;
      quantityHint: string;
      dailyLabel: string;
      dailyHint: string;
      durationLabel: string;
      durationHint: string;
      remainingLabel: string;
      remainingHint: string;
    };
    startedLabel: string;
    endsLabel: string;
    consumedTemplate: string;
    buyUntilTemplate: string;
    scheduledTitle: string;
    actions: {
      registerPurchase: string;
      editSchedule: string;
      editScheduleSoon: string;
      pause: string;
      pauseConfirm: string;
    };
    pauseSuccess: string;
  };
  scheduledAlerts: {
    refillDays: string;
    endsTomorrow: string;
    lastPill: string;
    registerPurchase: string;
    sentAt: string;
    scheduledFor: string;
    recipients: string;
  };
  recentReminders: {
    title: string;
    empty: string;
    reminderSent: string;
    notConfirmed: string;
    manualConfirmation: string;
    refillWarning: string;
    voiceFallback: string;
  };
  howWeWrite: {
    title: string;
    saysTitle: string;
    saysItems: string[];
    neverTitle: string;
    neverItems: string[];
  };
  modal: {
    titleNew: string;
    titleReplacement: string;
    fields: {
      name: string;
      dosage: string;
      quantity: string;
      doseUnits: string;
      dosesPerDay: string;
      startDate: string;
      times: string;
      instructions: string;
    };
    previewTitle: string;
    previewDaily: string;
    previewDuration: string;
    previewEnd: string;
    previewBuyUntil: string;
    previewInvalid: string;
    timesMismatch: string;
    cancel: string;
    save: string;
    saving: string;
    successNew: string;
    genericError: string;
    pausedHint: string;
    viewerHint: string;
  };
  pausedActionHint: string;
}

export interface FamilyChecklistTaskContent {
  title: string;
  subtitle: string;
  durationTag: string;
  ctaLabel: string;
  href: string;
  durationTone?: "ok" | "muted";
}

export interface FamilyHojeContent {
  primeiroAcesso: {
    welcomeNamed: string;
    welcomeNeutral: string;
    intro: string;
    checklistTitle: string;
    progressFeitas: string;
    checklistFooter: string;
    dayCardTitle: string;
    tourTitle: string;
    tourBody: string;
    tourPrimary: string;
    tourSecondary: string;
    emptyPanelTitle: string;
    emptyPanelItems: Array<{
      id: string;
      icon: string;
      title: string;
      getStatus: "medications" | "members" | "geo" | "exams";
      ctaLabel?: string;
      href?: string;
      tag?: string;
    }>;
    whatsAppCardTitle: string;
    whatsAppIntro: string;
    whatsAppBubble: string;
    whatsAppNote: string;
    whatsAppCta: string;
    viewerHint: string;
    pausedHint: string;
  };
  maduro: {
    urgencyCalm: string;
    urgencyAlert: string;
    reminderNote: string;
    stats: {
      nextLabel: string;
      nextEmpty: string;
      refillLabel: string;
      refillEmpty: string;
      refillHint: string;
      locationLabel: string;
      locationValue: string;
      locationHint: string;
      noticesLabel: string;
      noticesValue: string;
      noticesHint: string;
    };
    timelineCardTitle: string;
    weekButton: string;
    centralTitle: string;
    centralProgressProntas: string;
    centralFooter: string;
    centralTour: string;
    checklistAreas: Array<{
      id: string;
      labelDone: string;
      labelPending: string;
      href?: string;
    }>;
    needsTitle: string;
    needsEmpty: string;
    needsBuyTitle: string;
    needsBuySubtitle: string;
    weeklyTitle: string;
    weeklyTag: string;
    weeklyBody: string;
    weeklyExtra: string;
    activityTitle: string;
    activityEmpty: string;
  };
  checklistTasks: FamilyChecklistTaskContent[];
  welcomeModal: {
    titleNamed: string;
    titleNeutral: string;
    body: string;
    tourNote: string;
    primary: string;
    secondary: string;
    footer: string;
    storageKeyPrefix: string;
  };
  timeline: {
    completedStatus: string;
    reminderSent: string;
    notConfirmed: string;
    confirmed: string;
    upcoming: string;
    refillTitle: string;
    refillSubtitle: string;
    refillLink: string;
  };
  activity: {
    reminderSent: string;
    refillWarning: string;
    manualConfirmation: string;
    medicationAdded: string;
    emptyToday: string;
  };
  emptyDay: {
    icon: string;
    title: string;
    description: string;
    cta: string;
  };
  loadError: {
    title: string;
    description: string;
  };
}

export interface FamilyParticipantesContent {
  loadError: string;
  selfSuffix: string;
  emergencyPhoneNote: string;
  listCard: {
    titleTemplate: string;
    inviteButton: string;
    resendButton: string;
  };
  situation: Record<
    "active" | "pending" | "expired",
    { label: string; tone: "ok" | "warning" | "muted" }
  >;
  matrix: {
    title: string;
    legend: string;
    roleHeaders: Record<
      "admin" | "caregiver" | "viewer" | "emergency_contact",
      string
    >;
  };
  modal: {
    title: string;
    nameLabel: string;
    namePlaceholder: string;
    relationshipLabel: string;
    relationshipPlaceholder: string;
    contactLabel: string;
    contactPlaceholder: string;
    roleLabel: string;
    rolesHint: string;
    cancel: string;
    submit: string;
    submitting: string;
    nameRequired: string;
    contactInvalid: string;
    duplicatePending: string;
    duplicateActive: string;
    genericError: string;
    roles: Array<{ slug: string; label: string; description: string }>;
  };
  feedback: {
    inviteCreated: string;
    inviteResent: string;
    emergencyActive: string;
    copyLink: string;
    copied: string;
    resendError: string;
    validityNote: string;
    manualShareNote: string;
  };
  accept: {
    title: string;
    expiredTitle: string;
    expiredBody: string;
    alreadyAcceptedTitle: string;
    alreadyAcceptedBody: string;
    notFoundTitle: string;
    notFoundBody: string;
    emailMismatchTitle: string;
    emailMismatchBody: string;
    invitedByTemplate: string;
    roleTemplate: string;
    recipientTemplate: string;
    loginCta: string;
    acceptCta: string;
    accepting: string;
    enterPanelCta: string;
    successMessage: string;
  };
  viewerHint: string;
  pausedHint: string;
}

export const familyRoutes = {
  hoje: "/familia",
  remedios: "/familia/remedios",
  consultas: "/familia/consultas",
  avisos: "/familia/avisos",
  pedidosDeAjuda: "/familia/pedidos-de-ajuda",
  localizacao: "/familia/localizacao",
  exames: "/familia/exames",
  guia: "/familia/guia",
  participantes: "/familia/participantes",
  plano: "/familia/plano",
  ajustes: "/familia/ajustes",
} as const;

export const familyContent: FamilyContent = {
  brand: {
    name: "Zelita",
  },
  recipientPicker: {
    switchLabel: "trocar ⌄",
    ageUnknown: "idade não informada",
    modalTitle: "Quem você quer acompanhar",
    closeLabel: "Fechar",
    selectedTag: "Selecionado",
    addAnotherTitle: "Cadastrar outra pessoa",
    addAnotherSubtitle: "Disponível no plano Família · em breve",
    switchError:
      "Não foi possível trocar de conta agora. Tente de novo ou entre novamente.",
  },
  topbar: {
    tourLabel: "🎓 Tour",
    addMedicationLabel: "+ Remédio",
    addExamLabel: "+ Exame",
    signOutLabel: "Sair",
  },
  trialBar: {
    badgeTemplate: "Dia {current} de {total}",
    body: "Você está no ",
    bodyBold: "período grátis",
    bodySuffix:
      ". Nenhum cartão foi pedido e nada será cobrado — avisamos 5 dias antes de acabar.",
    ctaLabel: "Ver meu plano",
  },
  pausedBanner: {
    pausedTitle: "Conta pausada",
    pausedBody:
      "Seus dados estão preservados, mas algumas ações ficam limitadas até reativar o plano.",
    canceledTitle: "Conta cancelada",
    canceledBody:
      "O acesso ao painel continua disponível para consulta. Veja Meu plano ou fale com o suporte para reativar.",
    ctaLabel: "Ver meu plano",
  },
  nav: [
    {
      items: [
        {
          id: "hoje",
          emoji: "◉",
          label: "Hoje",
          path: familyRoutes.hoje,
        },
        {
          id: "remedios",
          emoji: "💊",
          label: "Remédios",
          path: familyRoutes.remedios,
        },
        {
          id: "consultas",
          emoji: "🗓",
          label: "Consultas e tarefas",
          path: familyRoutes.consultas,
        },
        {
          id: "avisos",
          emoji: "🔔",
          label: "Avisos",
          path: familyRoutes.avisos,
        },
      ],
    },
    {
      label: "Segurança",
      items: [
        {
          id: "pedidos-de-ajuda",
          emoji: "🆘",
          label: "Pedidos de ajuda",
          path: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "localizacao",
          emoji: "📍",
          label: "Onde ele está",
          path: familyRoutes.localizacao,
        },
      ],
    },
    {
      label: "Saúde",
      items: [
        {
          id: "exames",
          emoji: "📄",
          label: "Exames e receitas",
          path: familyRoutes.exames,
        },
      ],
    },
    {
      label: "Ajuda",
      items: [
        {
          id: "guia",
          emoji: "🎓",
          label: "Como usar a Zelita",
          path: familyRoutes.guia,
        },
      ],
    },
    {
      label: "Conta",
      items: [
        {
          id: "participantes",
          emoji: "👥",
          label: "Quem participa",
          path: familyRoutes.participantes,
        },
        {
          id: "plano",
          emoji: "💳",
          label: "Meu plano",
          path: familyRoutes.plano,
        },
        {
          id: "ajustes",
          emoji: "⚙",
          label: "Ajustes",
          path: familyRoutes.ajustes,
        },
      ],
    },
  ],
  areas: {
    hoje: {
      title: "Hoje",
      subtitle: "Como está o dia do {apelido}",
    },
    remedios: {
      title: "Remédios",
      subtitle: "O que ele toma e quando comprar mais",
    },
    consultas: {
      title: "Consultas e tarefas",
      subtitle: "A semana dele e quem faz o quê",
    },
    avisos: {
      title: "Avisos",
      subtitle: "Tudo que a Zelita te avisou",
    },
    "pedidos-de-ajuda": {
      title: "Pedidos de ajuda",
      subtitle: "Quando ele apertou o botão e o que aconteceu",
    },
    localizacao: {
      title: "Onde ele está",
      subtitle: "Só para você ficar tranquila",
    },
    exames: {
      title: "Exames e receitas",
      subtitle: "Guarde aqui e ache na hora da consulta",
    },
    guia: {
      title: "Como usar a Zelita",
      subtitle:
        "Cada função explicada: o que é, para que serve e como usar",
    },
    participantes: {
      title: "Quem participa",
      subtitle: "Irmãos, cuidadores e quem chamar numa emergência",
    },
    plano: {
      title: "Meu plano",
      subtitle: "O que você paga e o que está incluído",
    },
    ajustes: {
      title: "Ajustes",
      subtitle: "Como a Zelita fala com ele",
    },
  },
  placeholders: {
    consultas: {
      icon: "🗓",
      title: "Consultas e tarefas em breve",
      description:
        "Aqui você verá consultas, exames marcados e tarefas da semana — quem leva, quem acompanha e o que falta fazer.",
    },
    avisos: {
      icon: "🔔",
      title: "Seus avisos aparecerão aqui",
      description:
        "Quando a Zelita avisar sobre remédios, pedidos de ajuda ou outras situações, tudo ficará registrado nesta área.",
    },
    "pedidos-de-ajuda": {
      icon: "🆘",
      title: "Histórico de pedidos de ajuda",
      description:
        "Quando ele apertar o botão de ajuda, você verá aqui o que aconteceu, quem foi avisado e em que ordem.",
    },
    localizacao: {
      icon: "📍",
      title: "Localização em breve",
      description:
        "A última localização conhecida e os lugares de sempre ficarão aqui — sempre com autorização dele.",
    },
    exames: {
      icon: "📄",
      title: "Exames e receitas em breve",
      description:
        "Guarde fotos de exames e receitas para achar na hora da consulta, sem procurar em gavetas.",
    },
    guia: {
      icon: "🎓",
      title: "Guia da Zelita",
      description:
        "Cada função do painel explicada em palavras simples. O tour interativo de 1 minuto virá em uma atualização futura.",
    },
    participantes: {
      icon: "👥",
      title: "Quem participa em breve",
      description:
        "Convide irmãos, cuidadores e contatos de emergência. Cada pessoa verá só o que você permitir.",
    },
    plano: {
      icon: "💳",
      title: "Seu plano em breve",
      description:
        "Trial, uso e detalhes do que está incluído no seu plano aparecerão aqui — sem surpresas na cobrança.",
    },
    ajustes: {
      icon: "⚙",
      title: "Ajustes em breve",
      description:
        "Canais, tom das mensagens e preferências de privacidade ficarão aqui. Por enquanto, use Sair para encerrar a sessão.",
    },
  },
  guia: {
    tourNote:
      "O tour interativo de 1 minuto virá em uma atualização futura. Enquanto isso, leia cada seção abaixo no seu tempo.",
  },
  ajustes: {
    signOutDescription: "Encerra sua sessão neste aparelho.",
  },
  planLabels: {
    essential: "Essential",
    cuidado_plus: "Cuidado+",
  },
  mobileNav: {
    openLabel: "Abrir menu",
    closeLabel: "Fechar menu",
  },
  hoje: {
    primeiroAcesso: {
      welcomeNamed: "Bem-vinda, {nome}!",
      welcomeNeutral: "Bem-vindo!",
      intro:
        "A conta do {apelido} está criada. Agora falta o que a Zelita vai cuidar por você — e a primeira tarefa leva 40 segundos.",
      checklistTitle: "Comece por aqui",
      progressFeitas: "{count} de 4 feitas",
      checklistFooter:
        "Não precisa fazer as quatro hoje. Faça a primeira e volte quando der — a Zelita já começa a trabalhar.",
      dayCardTitle: "O dia do {apelido}",
      tourTitle: "Nunca usou a Zelita?",
      tourBody:
        "Um tour de 1 minuto mostra para que serve cada parte do painel, em palavras simples. Você pode sair quando quiser.",
      tourPrimary: "Fazer o tour de 1 minuto",
      tourSecondary: "Prefiro ler no meu tempo",
      emptyPanelTitle: "O que ainda está vazio",
      emptyPanelItems: [
        {
          id: "medications",
          icon: "💊",
          title: "Remédios",
          getStatus: "medications",
          ctaLabel: "Anotar",
          href: familyRoutes.remedios,
        },
        {
          id: "sos",
          icon: "🆘",
          title: "Pedidos de ajuda",
          getStatus: "members",
          ctaLabel: "Configurar",
          href: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "geo",
          icon: "📍",
          title: "Onde ele está",
          getStatus: "geo",
          tag: "Pendente",
        },
        {
          id: "exams",
          icon: "📄",
          title: "Exames e receitas",
          getStatus: "exams",
          ctaLabel: "Enviar",
          href: familyRoutes.exames,
        },
      ],
      whatsAppCardTitle: "Enquanto isso, {apelido}…",
      whatsAppIntro:
        "Recebeu no WhatsApp a mensagem da Zelita se apresentando e pedindo autorização.",
      whatsAppNote: "Nada é enviado antes dele aceitar.",
      whatsAppBubble:
        "Olá, {apelido}! Aqui é a Zelita. A sua família me pediu para lembrar o senhor dos remédios e dos compromissos. Posso enviar essas mensagens?",
      whatsAppCta: "Ver a conversa",
      viewerHint:
        "Peça ao administrador da conta para anotar remédios ou concluir estas tarefas.",
      pausedHint:
        "Conta pausada: você pode ver o checklist, mas não cadastrar remédios até reativar o plano.",
    },
    maduro: {
      urgencyCalm: "nada urgente com {apelido} agora",
      urgencyAlert:
        "atenção: remédio de {apelido} está acabando — veja abaixo",
      reminderNote:
        "A Zelita nunca diz que ele tomou o remédio. Ela só sabe que mandou o lembrete. Enquanto uma pessoa não confirmar, aparece “lembrete enviado” — e só você, ele ou a cuidadora podem confirmar de verdade.",
      stats: {
        nextLabel: "Próximo remédio",
        nextEmpty: "—",
        refillLabel: "Remédio acabando",
        refillEmpty: "0",
        refillHint: "{nome} acaba em {dias} dias",
        locationLabel: "Onde ele está",
        locationValue: "Em breve",
        locationHint: "Disponível após autorização",
        noticesLabel: "Avisos para ver",
        noticesValue: "0",
        noticesHint: "Histórico em breve",
      },
      timelineCardTitle: "O dia do {apelido}",
      weekButton: "Ver semana",
      centralTitle: "Sua central",
      centralProgressProntas: "{count} de 4 prontas",
      centralFooter:
        "Não tem pressa. Cada coisa que entra aqui é uma a menos para você lembrar.",
      centralTour: "🎓 Rever o tour",
      checklistAreas: [
        {
          id: "medications",
          labelDone: "Remédios · {detail}",
          labelPending: "Remédios · anote o primeiro",
          href: familyRoutes.remedios,
        },
        {
          id: "sos",
          labelDone: "Botão de ajuda · configure contatos",
          labelPending: "Botão de ajuda · configure em Pedidos de ajuda",
          href: familyRoutes.pedidosDeAjuda,
        },
        {
          id: "members",
          labelDone: "Família · {detail} participantes",
          labelPending: "Família · convide alguém",
          href: familyRoutes.participantes,
        },
        {
          id: "exams",
          labelDone: "Exames · guarde o primeiro",
          labelPending: "Exames · envie quando tiver",
          href: familyRoutes.exames,
        },
      ],
      needsTitle: "Precisa de você",
      needsEmpty:
        "Nada urgente por enquanto. Complete o checklist quando puder — sem pressa.",
      needsBuyTitle: "Comprar {medicamento}",
      needsBuySubtitle: "Acaba em {fim} · compre até {comprar}",
      weeklyTitle: "Resumo da semana",
      weeklyTag: "Em breve",
      weeklyBody:
        "Toda segunda, um resumo curto do que aconteceu: os lembretes, os remédios que estão acabando, os exames novos e o que mudou na rotina. Escrito em português simples, pronto para você mandar no grupo dos irmãos.",
      weeklyExtra:
        "Também está no plano: avisar quando algo sair do comum — por exemplo, dois dias seguidos sem nenhuma resposta dele.",
      activityTitle: "Atividade recente da família",
      activityEmpty: "Nada registrado ainda hoje",
    },
    checklistTasks: [
      {
        title: "Anote um remédio que ele toma",
        subtitle:
          "Copie o que está na caixa. A Zelita calcula sozinha quando vai acabar e te avisa antes.",
        durationTag: "40 segundos",
        ctaLabel: "Fazer agora",
        href: familyRoutes.remedios,
        durationTone: "ok",
      },
      {
        title: "Diga quem chamar numa emergência",
        subtitle:
          "Sem isso, o botão de ajuda avisa só você. Com dois contatos, ele avisa a família toda.",
        durationTag: "1 minuto",
        ctaLabel: "Adicionar",
        href: familyRoutes.pedidosDeAjuda,
      },
      {
        title: "Chame um irmão ou a cuidadora",
        subtitle:
          "Quem cuida sozinha se cansa. Cada pessoa vê só o que você permitir.",
        durationTag: "1 minuto",
        ctaLabel: "Convidar",
        href: `${familyRoutes.participantes}?modal=convite`,
      },
      {
        title: "Guarde um exame ou uma receita",
        subtitle:
          "Tire foto do papel. Na próxima consulta você acha em dois toques.",
        durationTag: "30 segundos",
        ctaLabel: "Enviar",
        href: familyRoutes.exames,
      },
    ],
    welcomeModal: {
      titleNamed: "Sua conta está pronta, {nome}!",
      titleNeutral: "Sua conta está pronta!",
      body: "Você tem {dias} dias grátis com tudo liberado. Quer que eu te mostre o painel em 1 minuto?",
      tourNote:
        "Tour de 1 minuto — você pode sair a qualquer momento.",
      primary: "Sim, me mostre o painel",
      secondary: "Prefiro explorar sozinha",
      footer: "Depois você acha o tour no botão 🎓 Tour, no alto da tela.",
      storageKeyPrefix: "zelita:welcome-dismissed:",
    },
    timeline: {
      completedStatus: "concluído",
      reminderSent: "{medicamento} — lembrete enviado no WhatsApp",
      notConfirmed: "tomada não confirmada",
      confirmed: "tomada confirmada manualmente",
      upcoming: "{medicamento} — lembrete será enviado",
      refillTitle: "A {medicamento} deve acabar em {dias} dias",
      refillSubtitle: "Compre outra caixa até {data}",
      refillLink: "anotar a nova caixa",
    },
    activity: {
      reminderSent: "lembrete enviado — {medicamento}",
      refillWarning: "aviso de cartela — {medicamento}",
      manualConfirmation: "confirmou tomada — {medicamento}",
      medicationAdded: "Você anotou {medicamento}",
      emptyToday: "Nada registrado ainda hoje",
    },
    emptyDay: {
      icon: "💊",
      title: "Nenhum remédio anotado ainda",
      description:
        "Quando você anotar o primeiro, o dia dele aparece aqui: cada horário, se o lembrete foi enviado e quantos dias faltam para a caixa acabar.",
      cta: "Anotar o primeiro remédio",
    },
    loadError: {
      title: "Não deu para carregar o Hoje",
      description:
        "Algo falhou ao buscar os dados. Recarregue a página ou tente de novo em instantes.",
    },
  },
  remedios: {
    loadError:
      "Não foi possível carregar os remédios agora. Recarregue a página ou tente de novo em instantes.",
    refillBanner: {
      title: "Atenção: um remédio está acabando.",
      body: "A caixa de {medicamento} deve terminar em {data}. Confirme com o idoso ou cuidador quantos comprimidos ainda tem e anote aqui a caixa nova.",
    },
    listCard: {
      title: "Remédios que ele toma",
      addButton: "+ Adicionar remédio",
      detailButton: "Detalhe",
    },
    listTags: {
      asNeeded: "Se necessário · sem horário fixo",
      noSchedule: "Sem horário fixo",
      warnDays: "Faltam {dias} dias",
      okDays: "{dias} dias restantes",
      noReminder: "Sem lembrete",
    },
    empty: {
      icon: "💊",
      title: "Nenhum remédio anotado ainda",
      description:
        "Anote o primeiro remédio que ele toma. A Zelita calcula quando a caixa acaba e te avisa antes — sem afirmar que ele tomou.",
      cta: "+ Adicionar remédio",
    },
    detail: {
      titleSuffix: "— cartela atual",
      stats: {
        quantityLabel: "Vieram na caixa",
        quantityHint: "comprimidos",
        dailyLabel: "Ele toma por dia",
        dailyHint: "comprimido",
        durationLabel: "A caixa dura",
        durationHint: "dias",
        remainingLabel: "Ainda dá para",
        remainingHint: "dias",
      },
      startedLabel: "Começou em {data}",
      endsLabel: "Deve acabar em {data}",
      consumedTemplate:
        "Pela conta, já foram {consumido} dos {total} comprimidos.",
      buyUntilTemplate: "Compre outra caixa até {data}",
      scheduledTitle: "Avisos programados desta cartela",
      actions: {
        registerPurchase: "Cadastrar nova compra",
        editSchedule: "Editar horários",
        editScheduleSoon: "Em breve",
        pause: "Pausar lembretes",
        pauseConfirm:
          "Pausar lembretes desta cartela? Isso não significa que ele parou de tomar o remédio.",
      },
      pauseSuccess: "Cartela pausada. Lembretes desta cartela param.",
    },
    scheduledAlerts: {
      refillDays: "Faltam {dias} dias",
      endsTomorrow: "Termina amanhã",
      lastPill: "Último comprimido",
      registerPurchase: "Cadastre nova compra",
      sentAt: "Enviado {data}",
      scheduledFor: "Programado {data}",
      recipients: "administradores da conta",
    },
    recentReminders: {
      title: "Últimos lembretes",
      empty: "Nenhum lembrete registrado ainda",
      reminderSent: "Lembrete enviado",
      notConfirmed: "tomada não confirmada",
      manualConfirmation: "confirmado por {ator}",
      refillWarning: "Aviso de cartela acabando",
      voiceFallback: "Ligação de reforço após lembrete",
    },
    howWeWrite: {
      title: "Como escrevemos",
      saysTitle: "✓ A Zelita diz",
      saysItems: [
        "Lembrete enviado",
        "Tomada não confirmada",
        "Cartela prevista para terminar hoje",
        "Verifique com o idoso ou cuidador",
        "Atenção: medicamento próximo do fim",
      ],
      neverTitle: "✕ A Zelita nunca diz",
      neverItems: ["O idoso tomou o medicamento", "Dose garantida"],
    },
    modal: {
      titleNew: "Nova cartela",
      titleReplacement: "Nova cartela",
      fields: {
        name: "Medicamento",
        dosage: "Dosagem",
        quantity: "Comprimidos na cartela",
        doseUnits: "Comprimidos por dose",
        dosesPerDay: "Doses por dia",
        startDate: "Início",
        times: "Horários",
        instructions: "Instrução para o idoso (opcional)",
      },
      previewTitle: "A conta é por nossa conta",
      previewDaily: "Ele toma por dia",
      previewDuration: "A caixa dura",
      previewEnd: "Deve acabar em",
      previewBuyUntil: "Compre outra até",
      previewInvalid:
        "Ajuste quantidade e doses para ver quando a cartela termina.",
      timesMismatch:
        "Selecione exatamente {count} horário(s), um por dose do dia.",
      cancel: "Cancelar",
      save: "Salvar cartela",
      saving: "Salvando…",
      successNew: "Remédio anotado. Lembrete enviado ≠ tomada confirmada.",
      genericError:
        "Não foi possível salvar agora. Verifique a conexão e tente de novo.",
      pausedHint:
        "Conta pausada: você pode ver os remédios, mas não cadastrar ou pausar cartelas até reativar o plano.",
      viewerHint:
        "Seu papel não permite cadastrar cartelas. Peça ao admin da conta.",
    },
    pausedActionHint:
      "Conta pausada — ações de cadastro e pausa ficam indisponíveis.",
  },
  consultas: {
    loadError:
      "Não foi possível carregar consultas e tarefas agora. Recarregue a página ou tente de novo em instantes.",
    weekGrid: {
      titleTemplate: "Semana de {inicio} a {fim} de {mes}",
      timeColumn: "Horário",
      prevWeek: "‹ anterior",
      nextWeek: "próxima ›",
      emptyCell: "—",
    },
    list: {
      appointmentsTitle: "Próximas consultas",
      tasksTitle: "Tarefas da família",
      addButton: "+ Adicionar",
      todayLabel: "Hoje",
      companionTag: "{nome} acompanha",
      appointmentsEmpty: {
        icon: "🗓",
        title: "Nenhuma consulta marcada",
        description:
          "Adicione consultas, exames ou fisioterapia para ver na grade da semana.",
      },
      tasksEmpty: {
        icon: "✓",
        title: "Nenhuma tarefa aberta",
        description:
          "Anote o que falta fazer — comprar remédio, ligar para o convênio, levar na consulta.",
      },
      completedSection: "Concluídas",
    },
    tasks: {
      assignedToYou: "atribuída a você",
      assignedToTemplate: "atribuída a {nome}",
      anyoneLabel: "qualquer um da família",
      untilTemplate: "Até {data}",
      metaSeparator: " · ",
      completeButton: "Concluir",
      reopenButton: "Reabrir",
      editButton: "Editar",
    },
    appointmentModal: {
      newTitle: "Nova consulta",
      editTitle: "Editar consulta",
      titleLabel: "O que é",
      titlePlaceholder: "Ex.: Dr. Aurélio ou Fisioterapia",
      specialtyLabel: "Especialidade ou tipo",
      specialtyPlaceholder: "Ex.: cardiologia",
      typeLabel: "Tipo",
      dateLabel: "Data",
      timeLabel: "Horário",
      timeOtherLabel: "Ou escolha outro horário",
      datetimeLabel: "Data e hora",
      locationLabel: "Local",
      locationPlaceholder: "Clínica, endereço ou sala",
      companionLabel: "Quem acompanha",
      companionNone: "Ninguém designado",
      preparationLabel: "Observação de preparo",
      preparationPlaceholder: "Ex.: jejum de 12h, levar exames",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando…",
      cancelAppointment: "Cancelar consulta",
      types: [
        { slug: "medical", label: "Consulta médica" },
        { slug: "physio", label: "Fisioterapia" },
        { slug: "exam", label: "Exame / laboratório" },
        { slug: "other", label: "Outro" },
      ],
    },
    taskModal: {
      newTitle: "Nova tarefa",
      editTitle: "Editar tarefa",
      titleLabel: "O que fazer",
      titlePlaceholder: "Ex.: Comprar Losartana",
      typeLabel: "Tipo",
      dueLabel: "Prazo (opcional)",
      assigneeLabel: "Atribuir a",
      assigneeNone: "Qualquer um da família",
      linkAppointmentLabel: "Vincular a consulta",
      linkAppointmentNone: "Nenhuma consulta",
      cancel: "Cancelar",
      save: "Salvar",
      saving: "Salvando…",
      types: [
        { slug: "shopping", label: "Compras" },
        { slug: "call", label: "Ligação" },
        { slug: "transport", label: "Transporte / logística" },
        { slug: "other", label: "Outro" },
      ],
    },
    feedback: {
      appointmentSaved: "Consulta salva.",
      appointmentCancelled: "Consulta cancelada.",
      taskSaved: "Tarefa salva.",
      taskCompleted: "Tarefa concluída.",
      taskReopened: "Tarefa reaberta.",
    },
    errors: {
      titleRequired: "Informe o nome da consulta ou compromisso.",
      datetimeRequired: "Informe data e hora.",
      datetimeInvalid: "Data ou hora inválida.",
      taskTitleRequired: "Informe o que precisa ser feito.",
      invalidCompanion:
        "Escolha outro membro ativo ou deixe em branco — o acompanhante selecionado não está mais na conta.",
      invalidLinkedAppointment:
        "A consulta vinculada não existe ou foi cancelada.",
      noPermission:
        "Seu papel não permite alterar consultas ou tarefas nesta conta.",
      paused:
        "Conta pausada: você pode ver a agenda, mas não alterar até reativar o plano.",
      generic:
        "Não foi possível concluir agora. Verifique a conexão e tente de novo.",
    },
  },
  participantes: {
    loadError:
      "Não foi possível carregar quem participa agora. Recarregue a página ou tente de novo em instantes.",
    selfSuffix: " (você)",
    emergencyPhoneNote:
      "Será avisado em emergências pelo telefone cadastrado — sem acesso ao painel.",
    listCard: {
      titleTemplate: "Quem participa do cuidado de {apelido}",
      inviteButton: "+ Convidar pessoa",
      resendButton: "Reenviar",
    },
    situation: {
      active: { label: "Ativa", tone: "ok" },
      pending: { label: "Convite pendente", tone: "warning" },
      expired: { label: "Expirado", tone: "muted" },
    },
    matrix: {
      title: "O que cada papel pode fazer",
      legend:
        "● permitido · ◐ depende de autorização por item · — sem acesso",
      roleHeaders: {
        admin: "Administrador",
        caregiver: "Cuidador",
        viewer: "Visualizador",
        emergency_contact: "Contato de emergência",
      },
    },
    modal: {
      title: "Convidar pessoa",
      nameLabel: "Nome",
      namePlaceholder: "Como chamar essa pessoa",
      relationshipLabel: "Relação (opcional)",
      relationshipPlaceholder: "Ex.: filha, cuidadora, irmã",
      contactLabel: "E-mail ou WhatsApp",
      contactPlaceholder: "nome@email.com ou (11) 90000-0000",
      roleLabel: "Papel",
      rolesHint:
        "Administrador edita tudo · Cuidador acompanha e registra · Visualizador só olha · Contato de emergência recebe o pedido de ajuda",
      cancel: "Cancelar",
      submit: "Enviar convite",
      submitting: "Enviando…",
      nameRequired: "Informe como chamar a pessoa.",
      contactInvalid:
        "Informe um e-mail válido ou celular com DDD para convidar.",
      duplicatePending:
        "Já existe um convite pendente para este contato. Use Reenviar na lista.",
      duplicateActive: "Esta pessoa já participa do cuidado desta conta.",
      genericError:
        "Não foi possível enviar o convite agora. Tente de novo em instantes.",
      roles: [
        {
          slug: "caregiver",
          label: "Cuidador",
          description: "Acompanha a rotina, registra observações e confirma tomadas.",
        },
        {
          slug: "viewer",
          label: "Visualizador",
          description: "Vê horários e rotina — sem alterar cadastros.",
        },
        {
          slug: "emergency_contact",
          label: "Contato de emergência",
          description:
            "Recebe alertas de SOS. Só telefone entra ativo sem login no painel.",
        },
        {
          slug: "admin",
          label: "Administrador",
          description: "Gerencia tudo, convites e assinatura.",
        },
      ],
    },
    feedback: {
      inviteCreated:
        "Convite criado. Ele vale 7 dias — compartilhe o link abaixo.",
      inviteResent:
        "Convite reenviado com novo prazo de 7 dias. Compartilhe o link abaixo.",
      emergencyActive:
        "Contato adicionado para emergências. Escalonamento completo virá em Pedidos de ajuda.",
      copyLink: "Copiar link",
      copied: "Link copiado!",
      resendError: "Não foi possível reenviar agora. Tente de novo.",
      validityNote: "Convite válido por 7 dias.",
      manualShareNote:
        "Envio automático por e-mail ainda não está disponível — copie e compartilhe o link manualmente.",
    },
    accept: {
      title: "Você foi convidado para cuidar com a Zelita",
      expiredTitle: "Este convite expirou",
      expiredBody:
        "Convite vale 7 dias. Peça para quem convidou clicar em Reenviar — leva um segundo.",
      alreadyAcceptedTitle: "Convite já aceito",
      alreadyAcceptedBody:
        "Este convite já foi usado. Entre no painel se você já faz parte da conta.",
      notFoundTitle: "Convite não encontrado",
      notFoundBody:
        "Este link não existe ou não é mais válido. Peça um novo convite à administradora.",
      emailMismatchTitle: "Entre com o e-mail convidado",
      emailMismatchBody:
        "Você está logado com outro e-mail. Saia e entre com o endereço que recebeu o convite, ou peça reenvio.",
      invitedByTemplate: "{nome} convidou você",
      roleTemplate: "Papel: {papel}",
      recipientTemplate: "Para cuidar de {apelido}",
      loginCta: "Entrar com o e-mail convidado",
      acceptCta: "Aceitar convite",
      accepting: "Aceitando…",
      enterPanelCta: "Ir para o painel",
      successMessage: "Convite aceito! Redirecionando…",
    },
    viewerHint:
      "Seu papel permite ver quem participa, mas não convidar ou reenviar convites.",
    pausedHint:
      "Conta pausada — convites e reenvios ficam indisponíveis até reativar.",
  },
};

/** Substitui `{apelido}` no template de subtítulo da área. */
export function formatFamilySubtitle(
  template: string,
  apelido: string,
): string {
  return template.replace("{apelido}", apelido);
}

/** Monta badge "Dia X de Y" da barra de trial. */
export function formatTrialBadge(
  template: string,
  current: number,
  total: number,
): string {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

/** Progresso do checklist — "X de 4 feitas" ou "X de 4 prontas". */
export function formatChecklistProgress(
  template: string,
  count: number,
): string {
  return template.replace("{count}", String(count));
}
