# Pendências

Lista viva do que falta entregar ou homologar. Itens concluídos saem daqui (e entram em `docs/implementation/` quando forem entregas).

## Agora

- [x] Migrations fatia 1 aplicadas no remoto (`001` + `002`)
- [x] Migration `003_bootstrap_family_account` aplicada no remoto (BG-01 onboarding/RLS)
- [x] Migration `004_safe_places_coords_optional` aplicada (Casa sem lat/lng no onboarding)
- [ ] Preencher WhatsApp (`WHATSAPP_*`) quando for sair do dry-run
- [ ] Homologar FL-01…FL-04 com chaves Supabase + Inngest
- [ ] Fatia 2: PWA + confirmar Casa (F2-05)

## Abertas pela F4 · Painel

- [ ] **Homologação manual F4.1 + F4.2 + F4.3** — shell, Hoje maduro e Remédios/modal via skill `manual-report`; replanejar FL-02/03 conforme `docs/F4/plan.md`
- [ ] **Editar horários (Remédios)** — botão visível “Em breve” na F4.3; pode gerar feedback de usuário até subfase futura
- [ ] **Conferência visual `/familia` e subrotas** — tipografia F0 + shell novo; exige sessão Supabase
- [ ] **Review humano paths críticos F4.1** — layout autenticado, `selectAccountAction`, `getShellContext`

## Abertas pela F0 · Fundação de design

- [ ] **Headers de segurança** (`SECURITY.md` A05) no `next.config.ts` — antes do deploy público da landing
- [x] **Marca d'água da landing em Inter** — resolvido na F1 com `font-head` no wordmark
- [ ] **Conferência visual de `/onboarding`** com a tipografia e os botões novos — exige sessão Supabase
- [ ] **Peças sem consumidor** — reavaliar após F1; `ListRow` ainda sem uso na landing (reservado para arte do hero via composição manual)
- [ ] **Medir LCP** com as duas famílias tipográficas na landing publicada (build/deploy)
- [ ] **Confirmar o adiamento de "Texto grande"** para a F5 (a escala já está ancorada em `--fs-body` / `--fs-body-elder`)

## Abertas pela F1 · Site

- [ ] **Headers A05** — pendência herdada; landing pública sem headers de segurança até deploy
- [ ] **Copy "Resumo semanal da família"** no plano Família — feature fora do MVP; copy do protótipo mantida por decisão de produto
- [ ] **Rodapé sem Privacidade/Termos** — exposição LGPD consciente enquanto CTAs captam cadastro; páginas legais fora do MVP
- [ ] **`/cadastro` vazio até F3** — ~~hoje só redireciona para `/entrar`~~ entregue na F3 (wizard 8 passos)
- [ ] **LCP das fontes** — medir após build de produção / deploy Vercel

## Abertas pela F2 · Entrar

- [ ] **Homologação manual F2** — fluxo Entrar (5 passos) via skill `manual-report`; FL-01 parcialmente coberto

## Abertas pela F3 · Cadastro

- [ ] **Homologação manual F3** — wizard 8 passos (FL-02) via skill `manual-report`; mobile + desktop
- [ ] **Review humano paths críticos F3** — auth (`verifySignupOtp`), bootstrap, `complete-signup`
- [ ] **Etiquetas no seletor de conta** — “1 aviso”, “Primeiro acesso”, etc. (fase posterior)
- [ ] **Passkey / biometria** — passo do protótipo adiado
- [ ] **Canal real de suporte** — WhatsApp placeholder na página de ajuda
- [ ] **Rota `/auth/callback` legada** — link mágico removido da UI; callback mantido para links antigos

## Homologação manual (skill `manual-report`)

Adiado explicitamente no Done da fatia 1 (domínio/Vitest verde; UI smoke manual depois das chaves):

- [x] **F1 · Landing** — TC-F1-01…TC-F1-06 aprovados (ver `docs/relatorio-testes-manuais.html`)
- [ ] FL-01 Auth OTP
- [ ] FL-02 Onboarding + pessoa cuidada
- [ ] FL-03 Remédios e cartela
- [ ] FL-04 Lembretes (job + WA sandbox)
- [ ] FL-05 PWA idoso
- [ ] FL-06 SOS
- [ ] FL-07 Segurança / RLS (smoke)
