export const elderRoutes = {
  home: "/idoso",
  schedule: "/idoso/horarios",
  family: "/idoso/familia",
  settings: "/idoso/ajustes",
  installed: "/idoso/instalado",
  login: "/entrar",
} as const;

export const elderContent = {
  banner:
    "Prévia da família. O celular dele ainda não abre sozinho. Pedir ajuda aqui não avisa ninguém.",
  unlinked: {
    title: "Este celular ainda não está ligado à família",
    body: "Quando a família preparar o atalho, os horários aparecem aqui. Por enquanto não há remédio nem telefone nesta tela.",
    familyLink: "Sou da família",
  },
  brand: "Zelita",
  letters: "Letras",
  home: {
    nextKicker: "Seu próximo remédio",
    finished: "Os avisos de hoje já saíram.",
    empty: "A família ainda não cadastrou horários.",
    help: "Preciso de ajuda",
    helpHint: "Aperte para ver como o pedido aparece",
    helpHintLinked: "Aperte se precisar falar com alguém agora.",
    callFamily: "Ligar para a família",
    today: "Meus horários de hoje",
  },
  schedule: {
    title: "Seus horários de hoje",
    lead: "A Zelita avisa em cada horário de remédio.",
    empty: "A família ainda não cadastrou horários.",
    note: "O senhor não precisa marcar nada aqui. É só para consultar.",
    loadError:
      "Não foi possível ler os horários agora. Recarregue a página. A ajuda e os telefones continuam disponíveis.",
  },
  family: {
    title: "Sua família",
    lead: "Toque no nome para ligar",
    noPhone: "Sem telefone cadastrado",
    samuTitle: "SAMU 192",
    samuDetail: "Emergência médica. Se for incêndio ou resgate, o número dos Bombeiros é 193.",
  },
  sos: {
    confirmTitle: "Você precisa de ajuda agora?",
    confirmBody:
      "Toque só se for para pedir ajuda. Nesta prévia, confirmar não avisa ninguém.",
    confirm: "Sim, preciso de ajuda",
    cancel: "Cancelar",
    sentTitle: "Sua família foi avisada. Aguarde contato.",
    sentSerious:
      "Se for grave, não espere. Ligue agora para o SAMU 192 ou os Bombeiros 193.",
    callSamu: "Ligar 192",
    backHome: "Voltar ao início",
    linkedConfirmBody:
      "Toque só se for para pedir ajuda. O aviso para a família ainda não sai por este celular.",
    linkedSentTitle: "O aviso ainda não sai por aqui",
    linkedSentBody:
      "A família ainda não recebe este pedido pelo aplicativo. Ligue para eles ou para o SAMU 192.",
    callFamily: "Ligar para a família",
  },
  linkDead: {
    title: "Este link não serve mais",
    body: "Peça para a família mandar outro. Nesta tela não há remédio nem telefone.",
  },
  activate: {
    title: "Usar a Zelita neste celular?",
    body: "Se confirmar, os horários desta pessoa aparecem neste navegador. O link funciona uma vez.",
    confirm: "Sim, quero usar",
    later: "Agora não",
    laterBody:
      "Tudo bem. Nada foi ligado neste celular. O link continua valendo até expirar, ou até a família gerar outro.",
  },
  installed: {
    title: "Adicionar à tela de início",
    lead: "Assim o atalho abre sem precisar do link.",
    steps: [
      "Toque em compartilhar, no navegador.",
      "Toque em Adicionar à Tela de Início.",
      "Toque em Adicionar.",
    ],
    help: "Se não conseguir, a família já vê este aparelho no painel e pode ajudar por telefone.",
    enter: "Ir para o início",
  },
  settings: {
    title: "Está fácil de ler?",
    lead: "O senhor pode deixar do seu jeito. É só tocar.",
    textLabel: "Tamanho das letras",
    textOptions: {
      pequeno: "Letra menor",
      medio: "Letra média",
      grande: "Letra maior",
    },
    colorLabel: "Cores",
    contrastNormal: "Normal",
    contrastStrong: "Contraste forte",
    cueLabel: "Avisos neste aparelho",
    sound: "Com som",
    vibrate: "Só vibrar",
    saved: "Guardado neste navegador.",
    saveError:
      "Não foi possível guardar o ajuste. Toque de novo. Se continuar, peça para a família recarregar a página.",
    saveDenied:
      "Este celular ainda não está ligado à família. O ajuste não foi guardado.",
    noVibrate:
      "Este aparelho não vibra. O botão continua aqui para quando a vibração existir.",
    noSound:
      "Não consegui tocar o som neste aparelho. O botão continua aqui.",
    whatsappNote:
      "Som e vibração tocam só neste aparelho. O WhatsApp não muda.",
    familyNote:
      "Se preferir, peça para alguém da família mudar por você.",
  },
  tabs: {
    home: "Início",
    schedule: "Horários",
    family: "Família",
  },
} as const;
