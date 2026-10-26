# Spec: Editar horários da cartela

- Status: `approved` (pedido de 26/10: antecipar só esta função do Gate 3)
- Data: 2026-10-26
- Autonomia: `tight` (altera quando o lembrete dispara)
- Projeto: Zelita (`apps/web`)

## 1. Objetivo

Quem administra a conta abre o detalhe de um remédio com cartela ativa e edita os horários. Os atalhos 08:00, 12:00, 18:00 e 22:00 continuam, e qualquer outro horário pode ser incluído. A quantidade de horários permanece igual às doses por dia já salvas. A duração da caixa não muda.

## 2. Fora de escopo

- Mudar doses por dia, quantidade, dosagem ou data de início
- Recalcular o fim da cartela
- Convite por e-mail, pagamento, voz, domínio e os demais itens do Gate 3
- Cancelar um evento Inngest já enfileirado por id; o envio confere o horário vigente e não manda o que saiu da lista

## 3. Comportamento

- O botão **Editar horários** fica ativo para o admin, com a conta fora de pausa.
- Salvar grava `medication_schedules.times` do remédio desta conta.
- Se houver cartela ativa, os horários de hoje que ainda não passaram são agendados de novo.
- Um lembrete cujo horário não está mais na lista é ignorado, sem gravar “enviado” nem “pulado”, para que voltar o horário no mesmo dia ainda possa lembrar.
- Lembrete enviado continua sem significar tomada.
