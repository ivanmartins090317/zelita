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
        href: familyRoutes.participantes,
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
