# Plano — F4 · Painel da família

- Status: `aprovado`
- Data: 2026-08-12
- Origem: `docs/state/PLANO-ALTA-FIDELIDADE.md` (§ F4) + research desta conversa
- Autonomia proposta: **`medium`** no macro; **`tight`** nas subfases que tocam paths críticos (ver §5)
- Pré-requisitos: F0 ✅ · F1 ✅ · F2 ✅ · F3 ✅ (Done técnico; homologação manual F2/F3 pendente)
- Referência visual: `zelita-prototipo.html` — aba **Painel da família** (`#s-fam`, linhas ~882+)
- Próximo artefato após aprovação: `specs/2026-08-12-f4-01-shell.md` (primeira Spec da sequência)

---

## Decisões propostas neste plano

| Tema | Decisão proposta |
| --- | --- |
| Granularidade | **12 Specs sequenciais** (F4.1…F4.12), uma aprovação por subfase |
| Layout do painel | **`app/(family)/layout.tsx`** com shell compartilhado; pages só conteúdo |
| Rotas | Prefixo **`/familia/...`** — mapa fechado na Spec F4.1 |
| Primeiro acesso | **Mesma rota `/familia`** — view derivada de dados (checklist), não rota separada |
| Troca de pessoa cuidada | **MVP: 1 recipient por conta** no seletor (UI fiel, sem multi-recipient real); cookie de conta (F2) reutilizado |
| Peças UI adiadas na F0 | **Modal** (`<dialog>`) na F4.1; **Timeline** na F4.2; **Tour** na F4.12 |
| Copy | Nova pasta **`content/family/`** (ou `content/family.ts` + splits) — separada do layout |
| SQL nas pages | **Eliminar** queries inline da fatia 1; repos em `infrastructure/` por módulo dono |
| Tour | **9 paradas** (array `TOUR` do protótipo); alinhar copy “8 paradas” na Spec F4.12 |
| Texto grande (topbar) | **Fora de F4** — mantém adiamento da F0 para F5; botão omitido ou desabilitado com nota na Spec F4.1 |
| Badges na sidebar | **Dados reais** quando o módulo existir; **omitir badge** (não mock) enquanto a subfase não entregar |
| Homologação | **Manual por subfase** (`manual-report`); replanejar FL-02/03 após F4.2/F4.3 |

---

## 1. Abordagem (6 passos)

### Passo 1 — Fundação do painel (F4.1)

Redigir e aprovar Spec F4.1. Criar `(family)/layout.tsx`, substituir `family-shell.tsx` pelo shell fiel (sidebar, seletor, topbar, trial bar). Introduzir primitivo **Modal**. Externalizar nav/copy em `content/family`. Rotas placeholder (empty state honesto) para os 11 destinos da sidebar. **Sem** lógica de negócio nova além de contexto + trial.

### Passo 2 — Entrada e dia a dia (F4.2)

Spec F4.2: **Primeiro acesso** (checklist 4 tarefas, widgets, modal `m-bemvinda`) + **Hoje** maduro (4 stats, timeline, “Sua central”, “Precisa de você”). Primitivo **Timeline**. Repos `medications`/`accounts` para leitura. Heurística “primeiro acesso” documentada na Spec.

### Passo 3 — Remédios em alta fidelidade (F4.3)

Spec F4.3: reescrever `/familia/remedios` — lista, detalhe cartela, modal `m-cartela` com preview ao vivo; substituir form inline. Reutilizar domínio `pack-end` e actions existentes.

### Passo 4 — Features com schema (F4.4 → F4.8)

Uma Spec por subfase, ordem recomendada: **Quem participa** → **Consultas** (`agenda`) → **Exames** → **SOS** → **Localização**. Cada uma: migration + RLS aprovados na Spec, módulo vertical, rota + empty states, checklist `SECURITY.md` específico (PHI, SOS, geo).

### Passo 5 — Agregação e conta (F4.9 → F4.11)

**Avisos** (histórico + matriz — depende de eventos das subfases anteriores; Spec define mínimo viável). **Ajustes** (canais, tom, privacidade; seção aparelhos stub até F6). **Meu plano** (trial, uso, sem gateway).

### Passo 6 — Guia e tour (F4.12)

Página **Como usar a Zelita** + tour guiado (9 paradas, spotlight). Depende de todas as views e `id`s estáveis do shell. Registrar entregas em `docs/implementation/` por subfase; homologação manual acumulada.

---

## 2. Arquivos a criar ou alterar

### Criar (macro — detalhe por Spec)

| Área | Arquivos / pastas |
| --- | --- |
| Specs | `specs/2026-08-12-f4-01-shell.md` … `f4-12-*.md` (12 arquivos) |
| Layout / shell | `apps/web/app/(family)/layout.tsx`, componentes em `modules/accounts/presentation/family/` |
| Copy | `apps/web/content/family.ts` (+ testes smoke) |
| Primitivos UI | `apps/web/components/ui/modal.tsx`, `timeline.tsx`, `tour/` (F4.12) |
| Rotas | `apps/web/app/(family)/familia/**/page.tsx` (11 views além das 2 existentes) |
| Módulos novos | `modules/agenda/**`, `modules/alerts/**` |
| Módulos a preencher | `modules/sos/**`, `modules/exams/**`, `modules/location/**`, `modules/billing/**` |
| Repos | `modules/*/infrastructure/*-repo.ts` (medications, accounts, …) |
| Schema | `supabase/migrations/005+_*.sql` + `supabase/policies/**` (por subfase aprovada) |
| Docs Done | `docs/implementation/2026-08-12-f4-*.md` (um por subfase entregue) |

### Alterar

| Arquivo | Papel |
| --- | --- |
| `modules/accounts/presentation/family-shell.tsx` | Substituído/evoluído pelo shell F4.1 |
| `modules/accounts/application/family-context.ts` | Dados para shell (trial, recipient display, memberships) |
| `modules/accounts/index.ts` | Exportar API pública do shell/contexto |
| `app/(family)/familia/page.tsx` | F4.2 — Hoje / Primeiro acesso |
| `app/(family)/familia/remedios/page.tsx` | F4.3 — remover queries inline |
| `modules/medications/**` | F4.3 — presentation + infrastructure |
| `docs/state/ATUAL.md` | WIP F4 |
| `docs/state/PENDENCIAS.md` | Homologação painel, peças UI, conferência visual |

### Alterar com cautela (path crítico)

| Arquivo | Subfase |
| --- | --- |
| `modules/accounts/**` (convites, papéis, ajustes) | F4.1, F4.4, F4.10 |
| `modules/accounts/domain/roles.ts` | F4.4 (matriz UI) |
| `modules/sos/**` | F4.7 |
| `modules/billing/**` | F4.11 |
| `modules/elder-access/**` | F4.10 (stub aparelhos) |
| `supabase/migrations/**`, `supabase/policies/**` | F4.4–F4.9, F4.10–F4.11 |

### Não tocar (salvo Spec explícita)

- `AGENTS.md`, `docs/prd-mvp.md`, `docs/SECURITY.md`, `docs/arquitetura-solucao.md`
- `apps/web/app/(marketing)/**`, `(auth)/**` (salvo redirect mínimo)
- `apps/web/app/(elder)/**` (F5)
- Gateway de pagamento, Playwright, novas dependências npm
- Telas **WhatsApp & voz** e **Cuidador** (decisão 2026-08-12)

---

## 3. Fora de escopo (macro F4)

- **Gateway de pagamento** — Meu plano é leitura + trial; sem Stripe/Pagar.me
- **PWA do idoso** e **vínculo de aparelho** — F5 / F6 (Ajustes só stub de aparelhos)
- **Jobs Inngest** completos (lembretes reais, trial ending, escalonamento SOS) — UI + schema primeiro; jobs quando subfase exigir
- **OCR / IA clínica** em exames
- **Resumo semanal automático** e **detecção de anomalia** — protótipo “Em breve”; fora do MVP
- **Multi recipient por conta** (troca pai/mãe) — UI preparada; persistência/seletor real fica para Spec futura se aprovado
- **Texto grande** no painel — F5 (decisão F0 mantida)
- **Passkey / biometria**
- **Nova dependência** (mapa, ícones, libs UI)
- **Playwright** e **Turborepo**
- **Headers A05** — pendência herdada F1

---

## 4. Riscos técnicos

| Risco | Mitigação proposta |
| --- | --- |
| **Shell errado propaga** para 11 views | Spec F4.1 `tight`; layout único; rotas placeholder cedo |
| **12 Specs = fila de aprovação longa** | Sequência fixa; não implementar fora da Spec aprovada |
| **Queries inline** da fatia 1 | Cada Spec de view exige repo + caso de uso; proibir `.from()` em `page.tsx` |
| **F4.9 antes dos eventos** | Spec define MVP (só `medication_events` + manual) e evolução incremental |
| **PHI em exames (F4.6)** | Autonomia `tight`; Storage + RLS por item; checklist SECURITY completo |
| **SOS (F4.7)** | Autonomia `tight`; coral só emergência; copy SAMU; sem acionar serviço público |
| **Mapa sem dependência (F4.8)** | Spec decide: endereço + pin estático / OSM embed / sem mapa no MVP |
| **Peças UI (Modal, Timeline, Tour)** | Criar na subfase que consome; API estável desde F4.1 para Modal |
| **Tour 8 vs 9 paradas** | Fixar 9 na F4.12; corrigir copy |
| **Homologação acumulada** | `manual-report` por subfase; não bloquear Done técnico se Supabase indisponível (documentar) |
| **Dívida F3 não homologada** | FL-02 antes ou em paralelo com F4.2; registrar dependência |

---

## 5. Path crítico

**Sim.** F4 toca vários paths críticos do `AGENTS.md` — intensidade por subfase:

| Path | Subfases | Autonomia |
| --- | --- | --- |
| `modules/accounts/**` (shell, convites, contexto) | F4.1, F4.4, F4.10 | **tight** |
| `modules/accounts/domain/**` | F4.4 (matriz papéis) | **tight** |
| `modules/sos/**` | F4.7 | **tight** |
| `modules/billing/**` | F4.11 | **tight** |
| `modules/elder-access/**` | F4.10 (stub) | **tight** |
| `supabase/migrations/**`, `supabase/policies/**` | F4.4–F4.9, F4.10–F4.11 | **tight** |
| `app/(family)/**` | todas | medium (UI; authz server-side) |
| `modules/medications/domain/**` | F4.3 (leitura; alteração mínima) | medium / tight se mudar regras |
| `modules/exams/**`, `modules/location/**` | F4.6, F4.8 | **tight** (PHI / geo) |

Subfases **sem** path crítico de domínio sensível: F4.2 (UI + leitura), F4.5 (agenda nova), F4.9 (medium), F4.12 (loose).

---

## 6. Aprovação humana

- [x] Plano aprovado · Data: 2026-08-12
- [ ] Confirmar autonomia macro: `medium` · outra: __________
- [ ] Confirmar sequência 12 Specs (F4.1 primeiro)
- [ ] Confirmar decisões da tabela inicial (layout único, 1 recipient MVP, Texto grande fora, tour 9 paradas)
- [ ] Confirmar ordem F4.4→F4.8 ou ajuste: __________

**Após aprovação:** atualizar `docs/state/ATUAL.md` e redigir `specs/2026-08-12-f4-01-shell.md` para segunda rodada de aprovação antes de implementar.
