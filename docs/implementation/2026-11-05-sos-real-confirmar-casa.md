# SOS real e Confirmar Casa

**Data:** 2026-11-05  
**Spec:** `specs/2026-11-05-sos-real-confirmar-casa.md`  
**Autonomia:** tight

## Entregue

No celular vinculado, “Sim, preciso de ajuda” grava `sos_alerts` com origem `elder_device` e publica `sos/notify`. O job avisa, ao mesmo tempo, cada pessoa da ordem salva por e-mail e grava a tentativa como `sent` ou `failed`. Sem chave da Resend, ou se o envio não sair, a tentativa fica `failed`. A tela do aparelho diz que a família foi avisada e lembra o SAMU 192 e os Bombeiros 193. A Zelita não liga.

Pedido aberto da mesma pessoa há menos de 2 minutos não cria outro e o job não reenvia. Pedido já resolvido não segura o seguinte. Conta pausada e “não incomodar” não entram nessa decisão.

Se a autorização de localização já estiver vigente e o navegador já tiver concedido o GPS, a confirmação espera no máximo 8 segundos. A coordenada, quando chega, vai para `location_points` com origem `sos`. O pedido não guarda a coordenada. Pedidos de ajuda usa esse ponto: “Ver no mapa” abre essa posição. Sem ponto, a tela segue “localização indisponível” e o pedido permanece.

“Estou em casa” só aparece no aparelho. Confirmar pede permissão, grava `geo_consent_at`, a posição da Casa e um ponto `home_confirm`. Negar ou falhar não grava nada. Vale em qualquer plano, inclusive trial.

Abrir o aplicativo só tenta o GPS quando o plano tem localização avançada, a Casa está confirmada, “avisar ao sair” está ligado e a autorização está vigente. Uma passagem de dentro para fora grava `zone_exit` e manda um e-mail para administradora e cuidadora. Não repete até uma leitura dentro da Casa gravar `zone_return`, sem e-mail. A mesma regra vale se a posição do pedido cair fora da Casa. Trial e Essencial confirmam a Casa e não disparam esse e-mail.

A prévia da família continua com a faixa âmbar. Confirmar ajuda não grava. `/idoso/casa` nessa prévia volta ao início.

## Fora desta entrega

- WhatsApp de SOS, ligação, voz e push
- Espera de 2 minutos entre uma pessoa e outra da ordem
- Leitura contínua de GPS
- Migration, policy nova ou coluna nova
- Homologação FL-05 / FL-06 no Vercel
- A copy da tela de ordem que ainda fala em “se ninguém responder em 2 min”

## Comandos Done

Na raiz, em 2026-11-05:

| Comando | Resultado |
| --- | --- |
| `pnpm typecheck` | verde |
| `pnpm lint` | verde (0 erros; aviso antigo em `location-actions.ts`, fora desta Spec) |
| `pnpm test` | verde — 90 arquivos, 445 testes |

Regras puras: janela de 2 minutos em `sos-repeat.test.ts`; saída, volta e bloqueio sem plano, Casa, aviso ou autorização em `zone-transition.test.ts`.

## Homologação

Não bloqueia este Done. Casos TC-FL06-01 a TC-FL06-10 ficam na rodada única. Roteiro: `docs/manual-dev/sos-real-confirmar-casa.md`.

Smoke local da prévia, com a sessão da família já aberta: `/idoso` mostra a faixa, não mostra “Estou em casa”, e “Sim, preciso de ajuda” cai no ensaio. `/idoso/casa` volta para `/idoso`. O aparelho vinculado de verdade não foi exercitado neste navegador.

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS | N/A — nenhuma policy nova. Quem não participa da conta continua sem ver o pedido pelas policies já existentes. O insert de pedido, ponto, Casa e saída usa `service_role` porque o insert autenticado desses registros está fechado |
| Autorização no servidor | OK — o identificador da pessoa sai do cookie do aparelho ativo. A prévia e a sessão da família não gravam. Coordenada validada com Zod antes de persistir |
| Elder-access | OK — a pessoa cuidada não vira `auth.users`. Aparelho revogado não registra |
| Zod | OK — coordenada do aparelho e id do pedido no job |
| `service_role` | OK no servidor, só depois do vínculo. A Spec autoriza a Server Action do aparelho, porque não há sessão da pessoa cuidada. O navegador não recebe a chave. O job Inngest usa o mesmo cliente para ler a ordem e gravar a tentativa |
| Webhooks | N/A |
| Upload de exame | N/A |
| Opt-in de lembrete | N/A — esta entrega não manda WhatsApp nem mexe em lembrete. O pedido de ajuda ignora “não incomodar” e conta pausada, como a Spec pede |
| SOS | OK — duas etapas, cancelar não grava, ordem inteira no mesmo momento, tentativa com resultado real, e-mail sem coordenada, telefone ou texto livre |
| Sentry sem PHI | OK — falhas com `sos_requested`, `sos_notify_failed`, `home_confirmed` e `zone_exit`, mais o id do pedido ou da pessoa. Sem nome, telefone, coordenada ou segredo do aparelho |
| Headers | N/A |
| Dependência nova | N/A |

## Reflexão

O pedido e a posição continuam registros separados: o alerta não ganhou coluna de coordenada, e Pedidos de ajuda procura o ponto `sos` gravado na mesma confirmação. A janela de 2 minutos e a transição de zona ficaram em funções puras, reusando Casa confirmada, raio e autorização. Trocar o canal do aviso, quando o template de WhatsApp existir, fica no job, sem reabrir a tela do idoso.

O `service_role` escreve só depois que o cookie do aparelho ativo resolve a pessoa. Se essa checagem falhar aberta, a prévia passaria a gravar ajuda de verdade; o caso de uso recusa cookie ausente, inválido ou de aparelho desligado antes de qualquer insert. O ponto que permanece é operacional: o e-mail usa o mesmo Resend do código de entrada e pode cair no spam. O painel é o canal que não depende da caixa de entrada. A saída de zona, no piloto, exige plano Cuidado+ de verdade.

## Arquivos principais

- `apps/web/modules/sos/domain/sos-repeat.ts`
- `apps/web/modules/sos/application/trigger-elder-sos.ts`
- `apps/web/modules/sos/application/get-pedidos-de-ajuda-page.ts`
- `apps/web/lib/inngest/notify-sos.ts`
- `apps/web/modules/location/domain/zone-transition.ts`
- `apps/web/modules/location/application/confirm-home-from-device.ts`
- `apps/web/modules/location/application/record-foreground-position.ts`
- `apps/web/modules/elder-access/presentation/elder-home.tsx`
- `apps/web/modules/elder-access/presentation/elder-confirm-home.tsx`
- `apps/web/app/(elder)/idoso/casa/page.tsx`
