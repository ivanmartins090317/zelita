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
