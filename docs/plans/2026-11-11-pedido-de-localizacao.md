# Plano — Pedir a posição do aparelho

- Status: `aprovado`
- Data: 2026-11-11
- Origem: research de 2026-11-11 sobre F4.8 ([`docs/implementation/2026-08-13-f4-08-localizacao.md`](../implementation/2026-08-13-f4-08-localizacao.md))
- Autonomia: `tight`
- Spec: rascunho em [`specs/2026-11-11-pedido-de-localizacao.md`](../../specs/2026-11-11-pedido-de-localizacao.md). Sem código até aprovação humana dessa Spec.
- Módulo dono: `location`. `elder-access` só escuta enquanto a tela está aberta e devolve a leitura

**Done deste plano:** a administradora, em `/familia/localizacao`, pede a posição atual. Se o aplicativo do idoso estiver aberto, com consentimento vigente, plano com localização e permissão de GPS já concedida, o aparelho grava um `location_points` de origem `on_demand` sem toque novo. O painel mostra o resultado ou o motivo de não ter chegado. Cuidadora continua só vendo a última posição.

---

## Decisões travadas no research

1. A leitura só acontece com o aplicativo aberto na tela. O painel diz isso.
2. Quem pede é a administradora. Cuidadora não vê o botão nem o estado do pedido. O ponto gravado entra no mapa e no histórico que ela já pode ver.
3. Mínimo de 2 minutos entre pedidos. O pedido fica aberto no máximo 5 minutos.
4. Não depende de “avisar ao sair” nem de a Casa estar confirmada. Depende de consentimento vigente, aparelho vinculado e plano com localização avançada.
5. Aplicativo fechado não é rastreado. O painel informa o motivo com base na última presença (`last_seen_at`), sem o celular avisar que fechou.

Presença fresca: o aplicativo, enquanto a aba está visível, atualiza `last_seen_at` a cada 30 segundos. Presença com mais de 90 segundos é “aplicativo não está aberto”. Hoje `last_seen_at` só muda quando a superfície do idoso carrega no servidor. Sem esse pulso, a tela deixada aberta pareceria fechada.

Estados do pedido:

- Presença velha e ainda sem ponto: “O aplicativo não está aberto neste celular.” O pedido continua aberto até os 5 minutos. Se a pessoa abrir o aplicativo nesse prazo, a posição ainda pode chegar.
- Aplicativo aberto e o GPS não sai (permissão ausente, leitura vazia ou tempo de 8 segundos estourado): “O celular não conseguiu enviar a posição.”
- Esteve aberto e os 5 minutos terminam sem ponto: “O aplicativo pode ter sido fechado ou o celular ficou sem acesso.”
- Ponto gravado: horário e precisão em metros, no mapa que já existe.

---

## 1. Abordagem

1. **Domínio puro.** Regras de quem pode pedir (só administradora), intervalo de 2 minutos, validade de 5 minutos e classificação do estado (aberto sem presença, pedindo, não enviou, sem resposta, concluído). Vitest nessas funções. Sem GPS, sem Supabase.
2. **Migration.** Nova tabela `location_requests` (pessoa cuidada, conta, quem pediu, status, pedido em, expira em, concluído em, motivo sem coordenada). RLS: insert e select só administradora; update do aparelho fica fechado para `authenticated` (`with check (false)`), no mesmo desenho de `location_points`. Novo valor `on_demand` no enum `location_point_source`.
3. **Pedido no painel.** Server action da administradora, com sessão, conta não pausada, consentimento vigente e `hasAdvancedLocation`. Grava o pedido. Não grava coordenada. Recusa se já existe pedido aberto ou se o anterior tem menos de 2 minutos.
4. **Aparelho em primeiro plano.** Enquanto a aba está visível, o PWA consulta se há pedido pendente e renova a presença. Com consentimento, cookie de device ativo e permissão já concedida, faz uma leitura (`getCurrentPosition`, alta precisão, no máximo 8 segundos, sem posição antiga) e grava o ponto `on_demand` ligado àquele pedido. Não abre prompt novo de permissão. Não mostra tela nova para o idoso.
5. **Painel de novo.** A página da administradora lê o pedido e o ponto. Mapa e histórico passam a incluir `on_demand`. Sentry só com ids e tipo do evento, sem latitude nem longitude.

A leitura de zona ao abrir o aplicativo continua como está. O pedido novo não passa por `canAttemptZoneReading`.

---

## 2. Arquivos

### Criar

- `supabase/migrations/014_location_requests.sql` — tabela, RLS e valor `on_demand`
- `apps/web/modules/location/domain/location-request.ts` + `location-request.test.ts`
- `apps/web/modules/location/infrastructure/location-request-repo.ts`
- `apps/web/modules/location/application/request-device-location.ts` — criar pedido (família) e cumprir pedido (device)
- `apps/web/modules/location/presentation/location-request-card.tsx`
- `apps/web/modules/elder-access/presentation/elder-location-listener.tsx` — pulso só com a aba visível

### Alterar

- `apps/web/modules/location/constants.ts` — 30s, 90s, 2 min, 5 min e a espera de GPS já usada (8s)
- `apps/web/modules/location/infrastructure/location-point-repo.ts` — aceitar origem `on_demand`
- `apps/web/modules/location/application/get-localizacao-page.ts` — pedido atual no view model da administradora
- `apps/web/modules/location/presentation/localizacao-page-view.tsx` — card do pedido
- `apps/web/modules/location/presentation/location-map-card.tsx` e `location-history-card.tsx` — ponto `on_demand` quando couber sem duplicar regra
- `apps/web/content/family.ts` — cópia dos quatro estados e do limite “só com o aplicativo aberto”
- `apps/web/modules/elder-access/presentation/elder-home.tsx` — monta o listener no aparelho vinculado
- `apps/web/modules/location/index.ts` — export só do que a rota da família precisa, sem puxar action de device para componente que importa constante no client (lição do BG-03)

O listener do idoso importa a action pelo arquivo dela, como `elder-home.tsx` já importa `recordForegroundPositionAction`. Não pelo barrel.

Spec em rascunho: `specs/2026-11-11-pedido-de-localizacao.md`. Código só depois da aprovação humana dessa Spec.

`docs/state/ATUAL.md` só muda quando este plano for aprovado. `docs/implementation/` só no Done.

---

## 3. Fora de escopo

- Acordar o celular fechado, push, service worker, app nativo ou localização em segundo plano
- Pedido pela cuidadora, visualizadora ou contato de emergência
- Mudar o alerta de saída de zona, o SOS ou o “Estou em casa”
- `watchPosition`, cron ou ping contínuo
- Aviso por WhatsApp ou e-mail quando a posição chegar
- Biblioteca nova de mapa
- Bateria e qualidade de sinal
- Tela no aparelho do idoso dizendo que a família pediu a posição
- `db push` neste passo. A migration entra no código da Spec. Aplicar no remoto continua pedido explícito
- Homologação formal no Vercel e relatório `manual-report`
- Editar PRD, `docs/SECURITY.md` ou a Spec F4.8 já entregue

---

## 4. Riscos técnicos

- **Presença.** `last_seen_at` hoje só atualiza no carregamento da superfície. Sem o pulso de 30s com a aba visível, o painel mente que o aplicativo está fechado. Com a aba em segundo plano o timer para. Isso é o sinal de “não está aberto”, não uma prova de rede.
- **Enum no Postgres.** `ALTER TYPE ... ADD VALUE` no mesmo arquivo da migration não pode ser usado por um `INSERT` dessa mesma migration. O valor `on_demand` só entra em uso no aplicativo, depois do push.
- **Service role.** O ponto continua inserido por `createSupabaseServiceClient`, porque `location_points_insert_service` recusa `authenticated`. A action de cumprir o pedido recusa chamada sem cookie de device ativo. A família não fabrica coordenada.
- **Permissão.** `readElderGrantedPosition` não pede permissão de novo. Se o idoso ainda não autorizou o GPS, o estado é “não conseguiu enviar”, mesmo com o aplicativo aberto.
- **Um pedido, uma leitura.** Repetir o GPS a cada pulso gastaria bateria. Falha na primeira tentativa encerra aquele pedido como “não enviou”. Outro pedido só depois de 2 minutos.
- **BG-03.** Exportar a action nova no barrel `index.ts` junto de código de servidor pode quebrar o client que importa `LOCATION_CONSTANTS`.
- **Segurança (`docs/SECURITY.md`).** A01: papel de administradora na action e na RLS. A03: Zod na coordenada e no id do pedido. A04: 2 minutos e expiração de 5 minutos. A09: Sentry sem latitude, longitude, nome ou telefone. O autor fica em `location_requests.requested_by`. Consentimento revogado ou conta pausada não cria pedido e o aparelho não lê o GPS.

---

## 5. Path crítico

**Sim.**

- `apps/web/modules/location/domain/**` — regra de quem pede e de quando a leitura vale
- `apps/web/modules/elder-access/**` e a tela do idoso — aparelho sem login passa a consultar pedido
- `supabase/migrations/**` — tabela nova, RLS e valor novo no enum

Não mexe em `accounts`, `billing` (só lê `hasAdvancedLocation`), `sos`, `.env` nem Inngest.

---

## Ordem depois da aprovação

1. Spec em `specs/` e parar de novo até aprovação humana
2. Implementar só o que a Spec pedir
3. `pnpm typecheck`, `pnpm lint`, `pnpm test`
4. Registrar em `docs/implementation/` e atualizar `docs/state/`
