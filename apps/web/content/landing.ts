export interface LandingNavContent {
  loginLabel: string;
  signupLabel: string;
}

export interface LandingHeroContent {
  eyebrow: string;
  title: string;
  subtitle: string;
  primaryCta: string;
  secondaryCta: string;
  trialNote: {
    emoji: string;
    highlight: string;
    rest: string;
  };
  footnote: string;
  art: {
    caption: string;
    medication: {
      icon: string;
      title: string;
      subtitle: string;
      tag: string;
    };
    location: {
      icon: string;
      title: string;
      subtitle: string;
      tag: string;
    };
    emergency: {
      icon: string;
      title: string;
      subtitle: string;
    };
  };
}

export interface LandingComparisonRow {
  label: string;
  value: string;
}

export interface LandingComparisonContent {
  title: string;
  lead: string;
  todayLabel: string;
  todayRows: LandingComparisonRow[];
  zelitaLabel: string;
  zelitaRows: LandingComparisonRow[];
}

export interface LandingPillarItem {
  number: string;
  title: string;
  description: string;
}

export interface LandingPillarsContent {
  title: string;
  lead: string;
  items: LandingPillarItem[];
}

export interface LandingFreebarContent {
  badgeLine1: string;
  badgeLine2: string;
  title: string;
  description: string;
  cta: string;
}

export interface LandingPlanFeature {
  text: string;
  emphasized?: boolean;
}

export interface LandingPlanItem {
  id: string;
  name: string;
  monthlyPrice: number;
  subtitle: string;
  freeTag: string;
  features: LandingPlanFeature[];
  cta: string;
  highlighted?: boolean;
  badge?: string;
}

export interface LandingPlansContent {
  title: string;
  lead: string;
  freeTag: string;
  perMonthSuffix: string;
  items: LandingPlanItem[];
}

export interface LandingPlanGuaranteeItem {
  emoji: string;
  title: string;
  description: string;
}

export interface LandingPlanGuaranteesContent {
  items: LandingPlanGuaranteeItem[];
}

export interface LandingUsabilityItem {
  badge: string;
  title: string;
  description: string;
}

export interface LandingUsabilityContent {
  title: string;
  lead: string;
  items: LandingUsabilityItem[];
  note: {
    emoji: string;
    title: string;
    description: string;
  };
}

export interface LandingPainItem {
  emoji: string;
  quote: string;
  description: string;
}

export interface LandingPainsContent {
  title: string;
  lead: string;
  items: LandingPainItem[];
}

export interface LandingHowItWorksStep {
  number: string;
  title: string;
  description: string;
}

export interface LandingHowItWorksContent {
  anchorId: string;
  title: string;
  lead: string;
  steps: LandingHowItWorksStep[];
}

export interface LandingProgressiveItem {
  badge: string;
  title: string;
  description: string;
  highlighted?: boolean;
}

export interface LandingProgressiveOnboardingContent {
  title: string;
  lead: string;
  items: LandingProgressiveItem[];
  note: {
    emoji: string;
    title: string;
    description: string;
  };
}

export interface LandingFooterContent {
  tagline: string;
  subtitle: string;
  disclaimer: string;
}

export interface LandingContent {
  nav: LandingNavContent;
  hero: LandingHeroContent;
  comparison: LandingComparisonContent;
  pillars: LandingPillarsContent;
  freebar: LandingFreebarContent;
  plans: LandingPlansContent;
  planGuarantees: LandingPlanGuaranteesContent;
  usability: LandingUsabilityContent;
  pains: LandingPainsContent;
  howItWorks: LandingHowItWorksContent;
  progressiveOnboarding: LandingProgressiveOnboardingContent;
  footer: LandingFooterContent;
}

export const landingRoutes = {
  signup: "/cadastro",
  login: "/entrar",
  howItWorksAnchor: "#como-funciona",
} as const;

export const landingContent: LandingContent = {
  nav: {
    loginLabel: "Entrar",
    signupLabel: "Começar 30 dias grátis",
  },
  hero: {
    eyebrow: "● Central de cuidado familiar",
    title: "Hoje, o cuidado do seu pai está todo na sua cabeça.",
    subtitle:
      "O horário de cada remédio. Quando a caixa acaba. A data do exame. O telefone da cuidadora. Onde foi parar a receita. A Zelita guarda tudo isso em um lugar só — e avisa quem precisa ser avisado, na hora certa.",
    primaryCta: "Começar 30 dias grátis",
    secondaryCta: "Ver como funciona por dentro",
    trialNote: {
      emoji: "🎁",
      highlight: "30 dias grátis, sem cartão de crédito.",
      rest: " Você só decide se vai pagar depois de um mês usando.",
    },
    footnote: "Ele não baixa nada nem cria senha. Cancelar leva dois cliques.",
    art: {
      caption: "Hoje · Seu João, 78 anos",
      medication: {
        icon: "💊",
        title: "Losartana 50 mg",
        subtitle: "08:00 · lembrete enviado no WhatsApp",
        tag: "Acaba em 5 dias",
      },
      location: {
        icon: "📍",
        title: "Em casa",
        subtitle: "Visto hoje às 09:14",
        tag: "Lugar de sempre",
      },
      emergency: {
        icon: "🆘",
        title: "Botão de ajuda",
        subtitle: "Avisa a família em segundos, com localização",
      },
    },
  },
  comparison: {
    title: "Onde está tudo isso hoje?",
    lead: "Espalhado. E a única pessoa que sabe onde cada coisa está é você.",
    todayLabel: "Como é hoje",
    todayRows: [
      { label: "Os horários dos remédios →", value: "na sua memória" },
      { label: "Quando a caixa acaba →", value: "você descobre quando falta" },
      { label: "Os exames →", value: "gaveta, e-mail, foto no celular" },
      { label: "A combinação com seus irmãos →", value: "grupo que ninguém lê" },
      { label: "O contato da cuidadora →", value: "agenda de um dos filhos" },
      { label: "Se acontecer uma emergência →", value: "quem estiver por perto resolve" },
    ],
    zelitaLabel: "Com a Zelita",
    zelitaRows: [
      { label: "Os horários →", value: "ela avisa ele no WhatsApp" },
      { label: "Quando a caixa acaba →", value: "ela te avisa 5 dias antes" },
      { label: "Os exames →", value: "achados em dois toques" },
      { label: "A combinação →", value: "tarefa com nome de quem faz" },
      { label: "Os contatos →", value: "na mão de todo mundo" },
      { label: "Uma emergência →", value: "a família toda sabe em segundos" },
    ],
  },
  pillars: {
    title: "Quatro coisas, um lugar só",
    lead: "Cada uma resolve uma dor de verdade. Juntas, tiram o cuidado da sua cabeça.",
    items: [
      {
        number: "1",
        title: "Remédios na hora certa",
        description:
          "Você anota uma vez. Ela avisa no horário e te lembra de comprar antes que a cartela acabe — a conta de quando acaba é ela que faz.",
      },
      {
        number: "2",
        title: "Botão de pedir ajuda",
        description:
          "Um botão grande e vermelho, com uma pergunta antes para não apertar sem querer. Avisa a família toda com o horário e o endereço.",
      },
      {
        number: "3",
        title: "Saber que ele está bem",
        description:
          "Mostra onde ele está e avisa se ele sair dos lugares de sempre. É para você ficar tranquila, não para vigiar — e ele autoriza antes.",
      },
      {
        number: "4",
        title: "Exames sem procurar",
        description:
          "Tire uma foto do papel e pronto. Na hora da consulta você acha em dois toques e mostra ao médico.",
      },
    ],
  },
  freebar: {
    badgeLine1: "30 dias",
    badgeLine2: "grátis",
    title: "Os primeiros 30 dias são de graça, em qualquer plano",
    description:
      "Sem cartão de crédito no cadastro. Sem cobrança automática no fim. No trigésimo dia a gente pergunta se você quer continuar — se você não responder, a conta simplesmente pausa.",
    cta: "Começar meus 30 dias",
  },
  plans: {
    title: "Planos",
    lead: "Quem paga é a família. O idoso nunca vê uma cobrança. Menos do que uma corrida de aplicativo até a casa dele — e você só decide depois de um mês usando.",
    freeTag: "30 dias grátis",
    perMonthSuffix: "/mês",
    items: [
      {
        id: "essencial",
        name: "Essencial",
        monthlyPrice: 39,
        subtitle: "1 pessoa cuidada · depois do teste",
        freeTag: "30 dias grátis",
        features: [
          { text: "Lembretes por WhatsApp" },
          { text: "Remédios e controle de caixa" },
          { text: "Botão de pedir ajuda" },
          { text: "Até 3 familiares" },
          { text: "Exames: 2 GB" },
        ],
        cta: "Testar 30 dias grátis",
      },
      {
        id: "cuidado-plus",
        name: "Cuidado+",
        monthlyPrice: 69,
        subtitle: "1 pessoa cuidada · depois do teste",
        freeTag: "30 dias grátis",
        highlighted: true,
        badge: "Mais escolhido",
        features: [
          { text: "Tudo do Essencial" },
          { text: "Lembrete por ligação de voz", emphasized: true },
          { text: "Onde ele está e lugares de sempre" },
          { text: "Familiares e cuidadores ilimitados" },
          { text: "Exames: 20 GB" },
        ],
        cta: "Testar 30 dias grátis",
      },
      {
        id: "familia",
        name: "Família",
        monthlyPrice: 119,
        subtitle: "Até 3 pessoas cuidadas · depois do teste",
        freeTag: "30 dias grátis",
        features: [
          { text: "Tudo do Cuidado+" },
          { text: "Pai e mãe na mesma conta" },
          { text: "Resumo semanal da família" },
          { text: "Atendimento prioritário" },
        ],
        cta: "Testar 30 dias grátis",
      },
    ],
  },
  planGuarantees: {
    items: [
      {
        emoji: "💳",
        title: "Não pedimos cartão para começar",
        description:
          "Você escolhe no cadastro: 30 dias grátis agora, ou assinar já e ganhar 2 meses.",
      },
      {
        emoji: "🔔",
        title: "Avisamos 5 dias antes de acabar",
        description:
          "Nada de cobrança surpresa. Você lembra do teste porque a gente lembra você.",
      },
      {
        emoji: "↩",
        title: "Cancelar leva dois cliques",
        description:
          "E seus dados continuam lá por 90 dias, caso você volte.",
      },
    ],
  },
  usability: {
    title: "Fácil para você. Fácil para ele.",
    lead: "A maioria dos aplicativos de saúde é feita para gente de trinta anos com boa visão. Este não é. Cada tela da Zelita passou por seis regras.",
    items: [
      {
        badge: "Aa",
        title: "Letra grande de verdade",
        description:
          "Nada abaixo de 17 pontos na tela dele. Um botão em todo canto para aumentar ainda mais, sem mexer nas configurações do celular.",
      },
      {
        badge: "👆",
        title: "Botões do tamanho do dedo",
        description:
          "Nenhum alvo com menos de 48 pixels de altura. Dedo tremido, unha grande ou luva continuam funcionando.",
      },
      {
        badge: "💬",
        title: "Palavras do dia a dia",
        description:
          "“Está na hora do remédio”, não “notificação de adesão terapêutica”. Frases curtas, uma ideia por vez, sem sigla e sem termo técnico.",
      },
      {
        badge: "1",
        title: "Uma ação por tela",
        description:
          "Na tela dele existe uma coisa importante de cada vez. Sem menu escondido, sem aba, sem rolar para achar o que interessa.",
      },
      {
        badge: "↩",
        title: "Nada é sem volta",
        description:
          "Toda ação séria pergunta antes e dá para cancelar. Ninguém pede ajuda sem querer nem apaga nada por engano.",
      },
      {
        badge: "🔒",
        title: "Nunca pedimos senha a ele",
        description:
          "Ele não cria conta, não digita e-mail, não decora senha e não instala nada. Quem cuida da parte chata é você.",
      },
    ],
    note: {
      emoji: "👀",
      title: "Também pensamos em quem enxerga pouco.",
      description:
        "Contraste alto em todo lugar, cor nunca sozinha para dar recado (sempre com texto junto), tudo navegável pelo teclado e compatível com o leitor de tela do celular.",
    },
  },
  pains: {
    title: "Você reconhece alguma dessas?",
    lead: "Na maioria das famílias, uma pessoa carrega tudo sozinha. Quase sempre a mesma pessoa. A Zelita nasceu das conversas com ela.",
    items: [
      {
        emoji: "😟",
        quote: '"Será que ela tomou o remédio?"',
        description: "A ansiedade de quem mora em outra cidade.",
      },
      {
        emoji: "👥",
        quote: '"Achei que você ia levar no médico"',
        description: "Falta de coordenação entre irmãos.",
      },
      {
        emoji: "💬",
        quote: '"A cuidadora não me avisou"',
        description: "Comunicação solta entre família e cuidador.",
      },
      {
        emoji: "💊",
        quote: '"Acabou o remédio ontem"',
        description: "Reposição sempre descoberta tarde demais.",
      },
      {
        emoji: "📄",
        quote: '"Cadê o exame de sangue?"',
        description: "Papéis espalhados em três casas.",
      },
      {
        emoji: "📞",
        quote: '"Ele caiu e ninguém soube"',
        description: "Nenhum caminho rápido em emergência.",
      },
    ],
  },
  howItWorks: {
    anchorId: "como-funciona",
    title: "Como funciona",
    lead: "O cadastro é curto e só pergunta o essencial. Remédios e exames você anota depois, já dentro do painel, com a Zelita te guiando passo a passo.",
    steps: [
      {
        number: "1",
        title: "Entre com seu e-mail",
        description: "Sem criar senha. Mandamos um código de 6 números.",
      },
      {
        number: "2",
        title: "Diga de quem você cuida",
        description: "Nome, como você chama, o WhatsApp e o endereço dele.",
      },
      {
        number: "3",
        title: "Escolha como falar com ele",
        description: "Só WhatsApp ou WhatsApp com ligação de reforço.",
      },
      {
        number: "4",
        title: "Escolha: grátis ou já assinar",
        description: "30 dias sem pagar nada, ou assine agora e ganhe 2 meses.",
      },
      {
        number: "5",
        title: "A Zelita te ensina o resto",
        description:
          "No painel, um tour de 1 minuto mostra cada função e te ajuda a anotar o primeiro remédio.",
      },
    ],
  },
  progressiveOnboarding: {
    title: "Você não precisa preencher tudo hoje",
    lead: "Esse é o medo de todo mundo com um sistema novo: a tela vazia pedindo cadastro. Na Zelita, o painel te diz exatamente o que fazer primeiro — e o primeiro passo leva 40 segundos.",
    items: [
      {
        badge: "40s",
        title: "Primeiro: um remédio só",
        description:
          "No painel, a primeira tarefa é anotar um remédio. Copie o que está na caixa e, antes de salvar, a Zelita já te diz quando ele vai acabar e até quando comprar outro. Você descobre uma coisa que não sabia sem ter feito quase nada.",
        highlighted: true,
      },
      {
        badge: "2min",
        title: "Depois: quem chamar",
        description:
          "Adicione seus irmãos e a cuidadora, e ligue o botão de pedir ajuda. A partir daí, se acontecer algo, a família toda fica sabendo junto — não só quem estava por perto.",
      },
      {
        badge: "∞",
        title: "Sem pressa: conforme a vida acontece",
        description:
          "Voltou de uma consulta? Fotografe o exame. Marcou fisioterapia? Anote. Nada disso é obrigatório — mas cada coisa que entra é uma coisa a menos na sua cabeça.",
      },
    ],
    note: {
      emoji: "📈",
      title: "É por isso que a Zelita melhora com o tempo.",
      description:
        "Um app de lembrete faz a mesma coisa no primeiro dia e no ano seguinte. Aqui, quanto mais a sua família usa, menos você precisa lembrar de qualquer coisa sozinha.",
    },
  },
  footer: {
    tagline: "Cuide de quem você ama, mesmo à distância.",
    subtitle:
      "Central de cuidado familiar · remédios, exames, emergência e localização em um lugar só",
    disclaimer:
      "A Zelita não substitui atendimento médico nem serviços públicos de emergência. Em caso de urgência ligue para o SAMU 192 ou os Bombeiros 193.",
  },
};

/** Blocos obrigatórios exportados pela landing — usado em smoke test. */
export const landingContentBlockKeys = [
  "nav",
  "hero",
  "comparison",
  "pillars",
  "freebar",
  "plans",
  "planGuarantees",
  "usability",
  "pains",
  "howItWorks",
  "progressiveOnboarding",
  "footer",
] as const satisfies readonly (keyof LandingContent)[];
