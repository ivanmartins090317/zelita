export const FAMILY_GUIDE_NAME = "Como usar a Zelita";

export const familyGuideTargetIds = {
  recipient: "recipient",
  hoje: "hoje",
  remedios: "remedios",
  consultas: "consultas",
  avisos: "avisos",
  pedidosDeAjuda: "pedidos-de-ajuda",
  localizacao: "localizacao",
  exames: "exames",
  participantes: "participantes",
  plano: "plano",
  ajustes: "ajustes",
  guia: "guia",
  shortcuts: "shortcuts",
} as const;

export const familyGuideBalloon = {
  back: "Voltar",
  next: "Próximo",
  skip: "Sair",
  done: "Entendi",
} as const;

export interface FamilyGuideStep {
  targetId: string;
  title: string;
  body: string;
}

export const familyGuideSteps: readonly FamilyGuideStep[] = [
  { targetId: familyGuideTargetIds.recipient, title: "Quem você acompanha", body: "Tudo neste painel é sobre esta pessoa. Se você cuidar de mais de uma, é aqui que troca." },
  { targetId: familyGuideTargetIds.hoje, title: "Hoje", body: "O dia dela, num relance: o próximo lembrete, o que está acabando e o que precisa de você. O atalho no celular dela também começa por aqui." },
  { targetId: familyGuideTargetIds.remedios, title: "Remédios", body: "Anote o que está na caixa. A Zelita calcula quando acaba e avisa antes. Lembrete enviado não quer dizer que o remédio foi tomado." },
  { targetId: familyGuideTargetIds.consultas, title: "Consultas e tarefas", body: "A semana: consultas, exames marcados e quem faz o quê." },
  { targetId: familyGuideTargetIds.avisos, title: "Avisos", body: "O que a Zelita contou fica guardado aqui. Aqui também se escolhe quem recebe o quê." },
  { targetId: familyGuideTargetIds.pedidosDeAjuda, title: "Pedidos de ajuda", body: "A ordem de quem é avisado quando o botão de ajuda é apertado. A Zelita avisa a família. Ela não chama o SAMU. Em risco de vida, ligue 192." },
  { targetId: familyGuideTargetIds.localizacao, title: "Onde ele está", body: "A última localização conhecida, com o horário. A autorização vem antes, e pode ser desligada quando quiser." },
  { targetId: familyGuideTargetIds.exames, title: "Exames e receitas", body: "Foto ou PDF de exame e receita, para achar na consulta. Cada arquivo tem quem pode ver." },
  { targetId: familyGuideTargetIds.participantes, title: "Quem participa", body: "Irmãos, cuidadora e quem chamar numa emergência. Cada papel vê só o que lhe cabe." },
  { targetId: familyGuideTargetIds.plano, title: "Meu plano", body: "O período grátis e o que está incluído. Nada é cobrado sozinho." },
  { targetId: familyGuideTargetIds.ajustes, title: "Ajustes", body: "Como a Zelita fala com a pessoa cuidada: canal, tom e o que foi autorizado. O lembrete no WhatsApp só sai depois do aceite." },
  { targetId: familyGuideTargetIds.guia, title: "Se esquecer", body: "Esta página explica cada parte: o que é, para que serve e como usar. Dá para refazer este caminho quando quiser, pelo mesmo nome, no alto da tela." },
  { targetId: familyGuideTargetIds.shortcuts, title: "Atalhos", body: "+ Remédio e + Exame anotam sem procurar no menu." },
];

export interface FamilyGuideRole {
  title: string;
  body: string;
}

export interface FamilyGuideTip {
  tone: "info" | "critical";
  label: string;
  text: string;
}

export interface FamilyGuideCard {
  id: string;
  icon: string;
  title: string;
  what: string;
  why: string;
  how: string;
  roles?: readonly FamilyGuideRole[];
  tip?: FamilyGuideTip;
}

export interface FamilyGuideQuestion {
  question: string;
  answer: string;
}

export interface FamilyGuidePage {
  noteLead: string;
  noteBody: string;
  questionsTitle: string;
  sectionWhat: string;
  sectionWhy: string;
  sectionHow: string;
  cards: readonly FamilyGuideCard[];
  questions: readonly FamilyGuideQuestion[];
}

const careRoles: readonly FamilyGuideRole[] = [
  {
    title: "Administrador",
    body: "edita tudo. Use para irmãos que ajudam de verdade.",
  },
  {
    title: "Cuidador",
    body: "vê a rotina, registra observações, confirma uma tomada.",
  },
  {
    title: "Visualizador",
    body: "só acompanha. Bom para netos e sobrinhos.",
  },
  {
    title: "Contato de emergência",
    body: "recebe o pedido de ajuda, mesmo sem usar o painel.",
  },
];

export const familyGuidePage: FamilyGuidePage = {
  noteLead: "Esta página existe para você não precisar adivinhar nada.",
  noteBody:
    "Cada função está em três partes: o que é, para que serve e como usar. Para ver no painel, use Como usar a Zelita.",
  questionsTitle: "Perguntas que todo mundo faz no começo",
  sectionWhat: "O que é",
  sectionWhy: "Para que serve",
  sectionHow: "Como usar",
  cards: [
    {
      id: "remedios",
      icon: "💊",
      title: "Remédios",
      what: "O lugar onde ficam todos os remédios que a pessoa cuidada toma, com horário e quantidade.",
      why: "A Zelita manda o lembrete no horário e — o mais útil — calcula sozinha quando a caixa vai acabar, avisando você 5 dias antes. É o fim do “acabou ontem”.",
      how: "Clique em + Remédio no alto da tela e copie o que está escrito na caixa: nome, dosagem, quantos comprimidos vieram, quantos ele toma por vez e quantas vezes ao dia. Antes de salvar você já vê a data em que vai acabar.",
      tip: {
        tone: "info",
        label: "Dica:",
        text: "remédio de “se necessário” pode ser anotado sem horário — aí a Zelita não manda lembrete, só guarda a informação.",
      },
    },
    {
      id: "pedidos-de-ajuda",
      icon: "🆘",
      title: "Pedidos de ajuda",
      what: "Um botão grande na tela dele que avisa a família quando ele precisa de ajuda.",
      why: "Em vez de ele ligar para uma pessoa por vez, um toque avisa todo mundo ao mesmo tempo, com o horário e o endereço onde ele está.",
      how: "Vá em Pedidos de ajuda e monte a ordem de quem é avisado primeiro. Quem estiver no topo recebe ligação e WhatsApp na hora; se ninguém responder em 2 minutos, a Zelita passa para o próximo da lista.",
      tip: {
        tone: "critical",
        label: "Importante:",
        text: "a Zelita não chama SAMU nem Bombeiros. Ela avisa a família. Em risco de vida, ligue 192 ou 193.",
      },
    },
    {
      id: "localizacao",
      icon: "📍",
      title: "Onde ele está",
      what: "A última localização conhecida dele, sempre com o horário do lado.",
      why: "Para você ficar tranquila sem ligar cinco vezes por dia. Você também marca os lugares de sempre — casa, igreja, mercado, clínica — e a Zelita avisa se ele sair de um deles.",
      how: "Primeiro ele precisa autorizar, e a Zelita pede isso pelo WhatsApp. Depois, em Onde ele está, você adiciona os lugares e marca em quais quer receber aviso de saída.",
      tip: {
        tone: "info",
        label: "Dica:",
        text: "deixe o raio em pelo menos 80 metros. Menor que isso, o GPS erra e você recebe aviso falso.",
      },
    },
    {
      id: "exames",
      icon: "📄",
      title: "Exames e receitas",
      what: "Uma gaveta digital para foto ou PDF de exame, receita e pedido médico.",
      why: "Para achar o papel em dois toques na sala de espera, em vez de procurar em três casas e no e-mail.",
      how: "Clique em + Exame, tire a foto pelo celular ou arraste o PDF, e diga o nome, a data e de qual médico é. Você escolhe quem pode ver cada arquivo.",
      tip: {
        tone: "info",
        label: "Dica:",
        text: "guarde a receita de uso contínuo e libere para a cuidadora. Ela costuma precisar mais que você.",
      },
    },
    {
      id: "participantes",
      icon: "👥",
      title: "Quem participa",
      what: "A lista de pessoas com acesso à conta, cada uma com um papel diferente.",
      why: "Para o cuidado não ficar só nas suas costas — e para você não precisar abrir tudo para todos.",
      how: "Em Quem participa, clique em convidar e escolha o papel:",
      roles: careRoles,
    },
    {
      id: "avisos",
      icon: "🔔",
      title: "Avisos",
      what: "O histórico de tudo que a Zelita te contou, com filtro por assunto.",
      why: "Para você não depender de rolar o WhatsApp para lembrar o que aconteceu na semana.",
      how: "Em Avisos você também define quem recebe o quê e por qual canal. Só o pedido de ajuda não pode ser desligado por um contato de emergência.",
      tip: {
        tone: "info",
        label: "Entenda a diferença:",
        text: "“lembrete enviado” quer dizer que a mensagem saiu. Não quer dizer que ele tomou o remédio — isso só uma pessoa pode confirmar.",
      },
    },
    {
      id: "hoje",
      icon: "◉",
      title: "Hoje",
      what: "A primeira tela do painel. O dia dela, num relance.",
      why: "Para ver o próximo lembrete, o que está acabando e o que precisa de você, sem abrir cada área.",
      how: "Abra pelo menu, em Hoje. O atalho no celular dela também começa por aqui. A Zelita não afirma que o remédio foi tomado: lembrete enviado não é tomada confirmada.",
    },
    {
      id: "consultas",
      icon: "🗓",
      title: "Consultas e tarefas",
      what: "A semana: consultas, exames marcados e quem faz o quê.",
      why: "Para saber quem leva e quem acompanha.",
      how: "Abra Consultas e tarefas no menu. Anote o dia, a hora e quem vai junto.",
    },
    {
      id: "plano",
      icon: "💳",
      title: "Meu plano",
      what: "O período grátis e o que está incluído na conta.",
      why: "Para ver o que a Zelita faz agora, sem cobrança surpresa.",
      how: "Abra Meu plano no menu. Nada é cobrado sozinho. Sem resposta, a conta pausa e os dados ficam guardados.",
    },
    {
      id: "ajustes",
      icon: "⚙",
      title: "Ajustes",
      what: "Como a Zelita fala com a pessoa cuidada: canal, tom e o que foi autorizado.",
      why: "Para o recado sair do jeito combinado.",
      how: "Abra Ajustes no menu. O lembrete no WhatsApp só sai depois do aceite.",
    },
  ],
  questions: [
    {
      question: "Meu pai precisa instalar algo?",
      answer:
        "Não. Ele recebe tudo no WhatsApp que já usa. O atalho na tela dele é opcional e não vem de loja de aplicativos.",
    },
    {
      question: "Ele precisa confirmar que tomou o remédio?",
      answer:
        "Não, e isso é de propósito. Depender de um toque por dia não funciona na vida real. Você, ele ou a cuidadora podem confirmar quando quiserem — mas nada trava sem isso.",
    },
    {
      question: "Ele vai saber que estou vendo onde ele está?",
      answer:
        "Sim, sempre. Ele autoriza antes e pode desligar quando quiser — e se desligar, você é avisada.",
    },
    {
      question: "Vou ser cobrada quando os 30 dias acabarem?",
      answer:
        "Não automaticamente. Avisamos 5 dias antes e perguntamos se você quer continuar. Sem resposta, a conta pausa e seus dados ficam guardados por 90 dias.",
    },
    {
      question: "E se ele receber uma mensagem pedindo cartão?",
      answer:
        "Não é a Zelita. Nunca mandamos cobrança, anúncio ou pedido de dado financeiro para a pessoa cuidada. Avise a gente se acontecer.",
    },
  ],
};

export function selectFamilyGuideSteps(
  availableTargetIds: ReadonlySet<string>,
): FamilyGuideStep[] {
  return familyGuideSteps.filter((step) =>
    availableTargetIds.has(step.targetId),
  );
}

export function formatFamilyGuideProgress(current: number, total: number): string {
  return `Passo ${current} de ${total}`;
}

export function familyGuideTargetSelector(targetId: string): string {
  return `[data-tour="${targetId}"]`;
}

function escapeFamilyGuideText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

export function buildFamilyGuideBalloonBody(
  step: FamilyGuideStep,
  current: number,
  total: number,
): string {
  return `<p class="family-guide-progress">${formatFamilyGuideProgress(current, total)}</p><p>${escapeFamilyGuideText(step.body)}</p>`;
}
