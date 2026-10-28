# F6 — Vínculo do aparelho

**Data:** 2026-10-28  
**Spec:** `specs/2026-10-28-f6-vinculo-aparelho.md`  
**Autonomia:** tight

## Entregue

A administradora gera um link de 15 minutos, de uso único, em `/familia/instalar`. “Estou longe” manda o template `zelita_device_link` para o WhatsApp já cadastrado, só com opt-in. “Estou com o celular dele” mostra o mesmo endereço em letra grande e não dispara mensagem. Sem token da Meta, o ambiente local registra dry-run. No Vercel, se o template não sair, a tela não diz que enviou e o link presencial continua valendo.

`GET /ativar/[token]` só confirma a intenção. “Agora não” não grava aparelho. “Sim, quero usar” prende aquele navegador, marca o token como usado e grava o cookie `zelita_elder_device` (`HttpOnly`, `Secure`, `SameSite=Lax`, path `/idoso`). O segredo da URL e o do cookie ficam só como hash SHA-256.

Com o cookie válido, `/idoso` lê os horários reais sem faixa de prévia e sem sessão Supabase. A prévia da família, com sessão e sem esse cookie, continua com a faixa e o ensaio da F5. No aparelho vinculado, confirmar ajuda não grava `sos_alerts` e não diz que a família foi avisada: oferece ligar para a família e para o SAMU 192.

Ajustes deixa de usar o stub. “Gerenciar” abre `/familia/instalar`. Cuidador vê o estado e não vê botão de enviar, mostrar link ou desvincular. Visualizador e contato de emergência recebem a mesma recusa de Ajustes. Desvincular vale no próximo carregamento, mesmo com o cookie ainda no celular. No máximo um aparelho ativo e 5 links por hora, por pessoa cuidada.

Depois de confirmar, `/idoso/instalado` mostra os três passos para adicionar à tela de início.

## Fora desta entrega

- Insert de SOS, ordem de aviso e resolução no painel
- GPS, Confirmar Casa e cidade do aparelho
- Template `zelita_device_link` aprovado na conta Meta (passo de operação)
- Homologação FL-05 no Vercel
- QR, service worker, login da pessoa cuidada

## Comandos Done

Na raiz, em 2026-10-28:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso antigo em `location-actions.ts`, fora desta Spec) |
| `pnpm test` | verde — 87 arquivos, 428 testes |
| `npm run db:push` | `013_elder_devices.sql` aplicada no projeto remoto |

Regras puras (expiração, uso único, um aparelho, papel, opt-in, hash, rótulo, dry-run no Vercel, porta da prévia) em `device-link.test.ts`.

## Homologação

Smoke local com a sessão já aberta: `/familia/instalar` mostra os dois caminhos, o WhatsApp mascarado e “Nenhum aparelho vinculado”. O caminho presencial devolveu o endereço em letra grande, com prazo em `America/Sao_Paulo`. Abrir o link mostrou só a confirmação, sem remédio e sem telefone. “Agora não” não consumiu o token: recarregar a mesma URL ainda oferecia “Sim, quero usar”.

`/ativar/encerrado` e um token malformado mostram a página calma. `/idoso` com a sessão da família segue com a faixa de prévia.

Não confirmei o aparelho neste navegador, para a prévia da família continuar disponível. O link presencial criado nesse smoke expira sozinho; não foi confirmado.

FL-05 no Vercel continua pendente. Os casos TC-FL05-08 a TC-FL05-14 não foram marcados como aprovados.

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS nas tabelas novas | OK — `care_recipient_device_links` e `care_recipient_devices`, forçada. Anon sem policy. Admin insere e invalida link. Admin e cuidador leem a visão sem hash. Só admin revoga. Trigger impede reabrir aparelho revogado e mudar o hash |
| Autorização no servidor | OK — papel conferido no caso de uso. `careRecipientId` vem da sessão da admin ou da linha achada pelo hash, nunca do corpo livre |
| Elder-access / vínculo revogável | OK — sem `auth.users` da pessoa cuidada. Cookie separado do da família e do cookie de letra. Revogação no servidor |
| Zod | OK — formato do token, canal e id do aparelho |
| Segredo / `service_role` | OK no servidor, só depois do hash. Usos: confirmar o aparelho, olhar se o link ainda serve (sem gravar), achar o cookie e ler a rotina daquela pessoa. A prévia da família segue no client autenticado. O hash não volta para a lista nem para o Sentry |
| Webhooks | N/A |
| Upload de exame | N/A |
| WhatsApp opt-in | OK no caminho remoto. Sem opt-in ou sem número, não envia. Template tipado; sem texto livre. Lembrete existente não mudou |
| SOS 2 etapas | Parcial — a confirmação continua. No aparelho vinculado nada é gravado e a frase de “avisada” não aparece. Insert, ordem e DND ficam no Gate 2.2 |
| Sentry sem PHI | OK — `elder_link_created`, `elder_link_sent`, `elder_link_rejected`, `elder_device_bound`, `elder_device_revoked`, `elder_device_opened` e falhas de leitura, com id da conta, id da pessoa, canal e motivo. Sem token, hash, telefone ou nome de remédio |
| Headers | N/A — config não foi alterada |
| Dependência nova | N/A |

Leitura nova na API de `care-recipients`: `readCareChannelForDeviceLink` devolve WhatsApp, opt-in e primeiro nome só para a administradora da sessão. Não muda papel nem RLS de pessoa cuidada.

## Reflexão

O vínculo ficou no módulo `elder-access`, com a regra pura separada do Supabase. A porta do `/idoso` escolhe o cookie do aparelho ou a prévia da família; as telas da F5 não foram duplicadas. Quando o Gate 2.2 gravar o SOS de verdade, a troca é o texto e o caso de uso do botão — a frase de “avisada” já está condicionada à prévia.

O `service_role` lê a rotina só a partir do hash do cookie. A lista da família passa pela visão sem segredo e pela policy de papel. O limite de cinco links por hora mora no caso de uso, e o banco ainda impede dois aparelhos ativos ao mesmo tempo. O ponto que permanece é operacional: o template `zelita_device_link` precisa ser aprovado na Meta antes do caminho remoto funcionar em produção. Até lá, o presencial cobre o vínculo.

## Arquivos principais

- `apps/web/modules/elder-access/**`
- `apps/web/app/(elder)/ativar/**`
- `apps/web/app/(elder)/idoso/**`
- `apps/web/app/(family)/familia/instalar/page.tsx`
- `apps/web/app/(family)/familia/ajustes/page.tsx`
- `apps/web/content/elder.ts`
- `apps/web/content/family.ts`
- `apps/web/modules/reminders/infrastructure/whatsapp-port.ts`
- `apps/web/modules/care-recipients/application/read-channel-for-device-link.ts`
- `supabase/migrations/013_elder_devices.sql`
- `supabase/policies/013_elder_devices.sql`
