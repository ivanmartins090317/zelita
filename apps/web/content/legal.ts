export const legalRoutes = {
  privacy: "/privacidade",
  terms: "/termos",
} as const;

export const legalContactEmail = "zelita@mail.modernxlab.com.br";

export interface LegalSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LegalPageContent {
  title: string;
  lastUpdatedLabel: string;
  lastUpdated: string;
  intro: string;
  sections: LegalSection[];
}

export interface LegalContent {
  backLabel: string;
  contactEmail: string;
  privacy: LegalPageContent;
  terms: LegalPageContent;
}

export const legalContent: LegalContent = {
  backLabel: "Voltar à página inicial",
  contactEmail: legalContactEmail,
  privacy: {
    title: "Política de Privacidade",
    lastUpdatedLabel: "Última atualização:",
    lastUpdated: "20 de setembro de 2026",
    intro:
      "Esta página explica, em linguagem simples, quais dados a Zelita trata para coordenar o cuidado familiar, por quê, com quem e quais direitos você tem pela LGPD. Não substitui um parecer jurídico; é o mínimo para quem se cadastra no produto.",
    sections: [
      {
        title: "Quem trata os dados",
        paragraphs: [
          "A Zelita é um software de coordenação familiar para cuidado de idosos. O tratamento no MVP é feito pela operação da Zelita. Pedidos sobre seus dados: zelita@mail.modernxlab.com.br. Quem já tem conta também pode solicitar exportação ou exclusão em Ajustes.",
        ],
      },
      {
        title: "Quais dados tratamos",
        paragraphs: [
          "Tratamos só o necessário para a conta, o painel da família e os canais de cuidado. Exemplos:",
        ],
        bullets: [
          "Conta da família: e-mail, nome, celular e papel de cada participante.",
          "Pessoa cuidada: nome, como chamar, nascimento, WhatsApp e endereço de casa — ela não cria login.",
          "Rotina de cuidado: remédios, horários, cartela, consultas, tarefas e observações.",
          "Exames e receitas: arquivo (foto ou PDF) e metadados, em armazenamento privado.",
          "Localização: só com consentimento revogável, para última posição e lugares de sempre.",
          "Mensagens: opt-in de WhatsApp, preferência de tom e janela de “não incomodar”.",
          "Uso técnico: sessão, identificadores de conta e registros de envio (sem copiar o conteúdo clínico para logs).",
        ],
      },
      {
        title: "Para que usamos",
        paragraphs: [
          "Usamos os dados para criar e autenticar a conta (código por e-mail), mostrar o painel da família, enviar lembretes só depois do opt-in no WhatsApp, guardar exames para quem você autorizar, registrar pedidos de ajuda (SOS) e cumprir obrigações legais. Um lembrete enviado nunca significa que o remédio foi tomado.",
        ],
      },
      {
        title: "Base legal (LGPD)",
        paragraphs: [
          "O cadastro e a execução do serviço apoiam-se na execução de contrato e no consentimento quando você cria a conta. Mensagens recorrentes no WhatsApp e localização exigem opt-in ou consentimento específico, revogáveis. Também podemos tratar dados para cumprir obrigação legal (por exemplo, atender um pedido LGPD) e para proteger a segurança da conta.",
        ],
      },
      {
        title: "Com quem compartilhamos",
        paragraphs: [
          "Não vendemos dados. Operadores técnicos recebem o mínimo para o produto funcionar:",
        ],
        bullets: [
          "Supabase — autenticação, banco e arquivos.",
          "Vercel — hospedagem do app.",
          "Resend — envio do código de acesso por e-mail.",
          "Meta (WhatsApp Business API) — mensagens de opt-in, lembrete e SOS, quando o canal estiver ligado.",
          "Sentry — erros técnicos com identificadores e tipo de evento, sem nome de remédio, telefone ou texto clínico desnecessário.",
        ],
      },
      {
        title: "Seus direitos",
        paragraphs: [
          "Você pode confirmar se tratamos dados, acessar, corrigir, anonimizar ou excluir, pedir portabilidade, revogar consentimento (WhatsApp, localização) e se opor a tratamento quando a lei permitir. Pedidos pelo e-mail acima ou em Ajustes; respondemos em até 15 dias úteis. Não há download imediato nem exclusão automática nesta etapa.",
        ],
      },
      {
        title: "Por quanto tempo guardamos",
        paragraphs: [
          "Mantemos os dados enquanto a conta estiver ativa e o necessário para o serviço. Se a conta for excluída ou o trial terminar sem assinatura, o acesso ao painel pausa; a exclusão definitiva segue o pedido em Ajustes ou pelo e-mail de contato.",
        ],
      },
      {
        title: "Alterações",
        paragraphs: [
          "Se esta política mudar de forma relevante, atualizamos a data no topo desta página. O uso continuado depois da publicação indica que você leu a versão vigente.",
        ],
      },
    ],
  },
  terms: {
    title: "Termos de uso",
    lastUpdatedLabel: "Última atualização:",
    lastUpdated: "20 de setembro de 2026",
    intro:
      "Estes termos descrevem o que a Zelita é, o que você pode esperar no cadastro e no trial, e o que ela não substitui. Ao criar uma conta, você concorda com este texto e com a Política de Privacidade.",
    sections: [
      {
        title: "O que é a Zelita",
        paragraphs: [
          "A Zelita ajuda a família a coordenar o cuidado de uma pessoa idosa: remédios, exames, pedidos de ajuda e localização, com lembretes no WhatsApp quando houver autorização. É software de organização familiar, não consultório, não prontuário médico completo e não serviço de emergência pública.",
        ],
      },
      {
        title: "Quem pode usar",
        paragraphs: [
          "A conta é da família (quem gerencia e paga). A pessoa cuidada recebe lembretes e pode usar o atalho no celular sem criar senha e sem ver cobrança. Você precisa ter capacidade de contratar e informar dados verdadeiros, inclusive de quem cuida.",
        ],
      },
      {
        title: "Cadastro e trial",
        paragraphs: [
          "O acesso da família é por e-mail e código, sem senha no MVP. O trial de 30 dias não pede cartão. Se ninguém assinar ao final, a conta pausa — não cobramos sozinhos. Planos e limites aparecem em Meu plano; pagamento real ainda pode estar em implantação.",
        ],
      },
      {
        title: "Emergência e saúde",
        paragraphs: [
          "A Zelita não substitui atendimento médico nem o SAMU 192 ou os Bombeiros 193. O pedido de ajuda avisa a família e os papéis configurados; não aciona serviço público. Decisões clínicas, dose e diagnóstico são da família e dos profissionais de saúde — nunca do app.",
        ],
      },
      {
        title: "Suas responsabilidades",
        paragraphs: [
          "Cabe a você manter horários e cartela corretos, convidar só quem deve participar, respeitar o opt-in de WhatsApp da pessoa cuidada e o consentimento de localização, e não usar o produto para fins ilícitos. Lembrete enviado não prova que o remédio foi tomado.",
        ],
      },
      {
        title: "Disponibilidade",
        paragraphs: [
          "Nos esforçamos para manter o app no ar, mas internet, WhatsApp, e-mail e nuvem podem falhar. Não garantimos envio ininterrupto de mensagem. Em urgência, ligue para o serviço público de emergência.",
        ],
      },
      {
        title: "Encerramento",
        paragraphs: [
          "Você pode sair da conta e pedir exclusão dos dados pelos canais da Política de Privacidade. Podemos suspender o acesso em caso de abuso, risco à segurança ou descumprimento destes termos.",
        ],
      },
      {
        title: "Contato e foro",
        paragraphs: [
          "Dúvidas: zelita@mail.modernxlab.com.br. Estes termos seguem a lei brasileira. Fica eleito o foro do domicílio do usuário no Brasil, salvo disposição legal em contrário.",
        ],
      },
    ],
  },
};
