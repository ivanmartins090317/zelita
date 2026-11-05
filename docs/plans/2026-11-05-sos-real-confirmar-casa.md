# Plano — SOS real e Confirmar Casa

- Status: `aprovado`
- Data: 2026-11-05
- Origem: research de 2026-11-05 + Gate 2.2 em [`docs/plans/2026-09-11-producao-real.md`](./2026-09-11-producao-real.md) § 6.3 + `docs/state/PENDENCIAS.md`
- Autonomia: `tight`
- Spec: [`specs/2026-11-05-sos-real-confirmar-casa.md`](../../specs/2026-11-05-sos-real-confirmar-casa.md) — `draft`, aguardando aprovação humana
- Módulos donos: `sos` (pedido e aviso) e `location` (Casa e zona). `elder-access` só dispara e mostra a tela.

**Done deste plano:** no celular vinculado, “Sim, preciso de ajuda” grava `sos_alerts` e a família vê o pedido em Pedidos de ajuda, com e-mail para a ordem salva. “Estou em casa agora” grava a posição da Casa. Alerta de saída só no Cuidado+, com Casa confirmada e “avisar ao sair” ligado. Prévia sem aparelho continua sem gravar nada.

---

## Decisões travadas no research

1. Aviso da ordem é simultâneo. Sem espera de 2 minutos entre pessoas.
2. SOS ignora “não incomodar”. Conta pausada ainda grava e avisa: é ajuda, não lembrete.
3. Canal desta entrega: painel (a linha do alerta) + e-mail Resend. WhatsApp de SOS espera template Meta `zelita_sos`. Sem texto livre.
4. GPS no SOS é extra e com tempo curto. Falha de GPS não cancela o pedido.
5. Confirmar Casa é uma leitura em primeiro plano. Sem `watchPosition` e sem cron de posição.
6. Coordenada do SOS fica em `location_points` (`source = sos`). Sem migration. Pedidos de ajuda deixa de passar `lat: null` fixo e usa esse ponto.
7. Confirmar Casa vale em qualquer plano, inclusive trial. Aviso de saída de zona só com `hasAdvancedLocation` (Cuidado+). Trial não promove o plano.
8. Toque duplo: alerta aberto da mesma pessoa nos últimos 2 minutos não cria outro nem reenvia.

---

## 1. Abordagem

1. **Domínio puro.** Função de repetição do SOS (aberto nos últimos 2 minutos). Função de transição de zona: ponto anterior dentro do raio e ponto novo fora, e ainda não há saída aberta desde a última volta. Vitest nas duas. Reusar `hasConfirmedHomeCoords`, `isInsideSafeZone` e `isLocationConsentActive`.
2. **SOS pelo aparelho.** Server action só com cookie de device ativo. Service role insere `sos_alerts` (`trigger_source = elder_device`) e, se o consentimento já estiver ativo e o navegador responder a tempo, um `location_points` de origem `sos`. Publica `sos/notify`. Prévia da família, sem cookie, não chama essa action.
3. **Job `sos/notify`.** Lê a ordem já salva. Para cada pessoa: e-mail via `sendTransactionalEmail` e uma linha em `sos_notification_attempts` com status real (`sent` ou `failed`). Não consulta DND. Não liga. Sentry só com id do alerta e tipo do evento, sem nome, telefone ou coordenada.
4. **Confirmar Casa.** Tela única no PWA vinculado: “Você está em casa agora?”. Sim pede permissão, grava `geo_consent_at` e um ponto `home_confirm`, e preenche `lat`, `lng` e `coords_confirmed_at` da Casa. Permissão negada ou GPS falho não grava coordenada.
5. **Saída de zona.** Ao abrir o PWA em primeiro plano (e no SOS, se houver ponto), se Casa confirmada + `alert_on_exit` + Cuidado+: compara com o ponto anterior. Uma saída gera um `geofence_events` `zone_exit` e um e-mail. Não repete enquanto a pessoa não voltar.
6. **Painel.** Pedidos de ajuda mostra o alerta, a localização do ponto `sos` quando existir, e as tentativas de e-mail como estão no banco. Copy do idoso no aparelho vinculado passa a dizer que a família foi avisada, com o aviso do SAMU 192.

---

## 2. Arquivos

### Criar

- `apps/web/modules/sos/domain/sos-repeat.ts` + `sos-repeat.test.ts` — janela de 2 minutos
- `apps/web/modules/sos/application/trigger-elder-sos.ts` — cookie, insert, evento
- `apps/web/lib/inngest/notify-sos.ts` — fan-out de e-mail
- `apps/web/modules/location/domain/zone-transition.ts` + `zone-transition.test.ts`
- `apps/web/modules/location/application/confirm-home-from-device.ts`
- `apps/web/modules/location/application/record-foreground-position.ts` — leitura ao abrir, sem loop
- `apps/web/modules/elder-access/presentation/elder-confirm-home.tsx`
- `apps/web/app/(elder)/idoso/casa/page.tsx`

### Alterar

- `apps/web/modules/elder-access/presentation/elder-home.tsx` — confirmar ajuda chama a action só com aparelho vinculado
- `apps/web/modules/elder-access/domain/elder-schedule.ts` — ensaio da prévia continua sem persistir
- `apps/web/content/elder.ts` — copy do SOS vinculado e da Casa
- `apps/web/modules/sos/infrastructure/sos-alert-repo.ts` — insert via service role
- `apps/web/modules/sos/infrastructure/sos-notification-repo.ts` — insert da tentativa
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.ts` — ponto `sos` no lugar de `lat: null`
- `apps/web/modules/location/infrastructure/location-point-repo.ts` — insert
- `apps/web/modules/location/infrastructure/geofence-event-repo.ts` — insert
- `apps/web/modules/location/infrastructure/safe-place-repo.ts` — confirmar coords da Casa pelo service role
- `apps/web/lib/inngest/functions.ts` — registrar `notify-sos`
- `apps/web/modules/sos/index.ts` e `apps/web/modules/location/index.ts` — só o que a rota do idoso precisa
- `docs/state/ATUAL.md` e `docs/state/PENDENCIAS.md` — no Done, não neste plano

Spec prevista depois da aprovação: `specs/2026-11-05-sos-real-confirmar-casa.md`.

---

## 3. Fora de escopo

- Template Meta `zelita_sos` e envio de SOS por WhatsApp
- Ligação, voz e push
- Cascata com espera entre contatos
- `watchPosition`, ping periódico e cron de GPS
- Migration, RLS nova ou coluna nova
- Simular SOS pelo painel da família
- Homologação FL-05 / FL-06 no Vercel (rodada única, depois do código)
- Gate 3: e-mail de convite, tour, pagamento, domínio, passkey
- Aprovar `zelita_device_link` (ops, paralelo, não bloqueia este código)

---

## 4. Riscos técnicos

- **Service role.** Insert de alerta, ponto, Casa e evento de zona passa por `createSupabaseServiceClient`, porque as policies de insert para `authenticated` estão fechadas. A action precisa recusar qualquer chamada sem cookie de device ativo. Família logada na prévia não pode gravar.
- **Mapa do SOS.** O alerta não tem lat/lng. O “Ver no mapa” depende de achar o `location_points` gravado na mesma ação. Se o ponto não entrar, a tela continua “localização indisponível” e o pedido permanece.
- **Permissão de GPS.** Safari e Chrome pedem gesto do usuário. Casa nasce de um toque. Leitura ao abrir o app pode falhar em silêncio; isso não pode quebrar o início nem o SOS.
- **E-mail no spam.** O OTP já cai no spam. O aviso de SOS usa o mesmo Resend. O painel é o canal que não depende da caixa de entrada.
- **Zona no trial.** A conta de piloto nasce Essencial. Confirmar Casa aparece; o e-mail de saída não. Testar a saída exige plano Cuidado+ de verdade.
- **PHI.** Coordenada, nome e telefone não entram no Sentry. Log de desenvolvimento só com ids.

---

## 5. Path crítico

**Sim.**

- `apps/web/modules/sos/**` — emergência
- `apps/web/modules/elder-access/**` e `apps/web/app/(elder)/**` — aparelho sem login
- `apps/web/modules/location/**` — coordenada e consentimento
- `apps/web/lib/inngest/**` — aviso que ignora DND

Não mexe em `supabase/migrations/**`, `accounts`, `billing` nem `.env`.

---

## Ordem depois da aprovação

1. Spec em `specs/` e parar de novo até aprovação humana
2. Implementar só o que a Spec pedir
3. `pnpm typecheck`, `pnpm lint`, `pnpm test`
4. Registrar em `docs/implementation/` e atualizar `docs/state/`
