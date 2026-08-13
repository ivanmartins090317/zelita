# F4.6 — Exames e receitas

**Data:** 2026-08-13  
**Spec:** `specs/2026-08-13-f4-06-exames-receitas.md`  
**Autonomia:** medium

## Resumo

Área **Exames e receitas** implementada com tabela, busca, filtros por categoria, detalhe com pré-visualização (PDF/imagem), upload (PDF/JPG/PNG/WebP até 25 MB), autorização por membro, download, link temporário público (`/l/[token]`), card stub **Leitura automática**, e integração com Hoje (checklist tarefa 4, Sua central, Precisa de você).

## Comandos Done

```text
pnpm typecheck  ✅
pnpm lint       ✅
pnpm test       ✅ (223 testes)
```

## Migration

- `supabase/migrations/007_exams_storage.sql` — tabelas `exams`, `exam_member_access`, `exam_share_links`, bucket Storage `exams`, RLS + policies
- **Remoto:** executar `pnpm db:push` quando Supabase estiver configurado

## Cota de armazenamento

- Essencial: 2 GB · Cuidado+/trial MVP: 20 GB (até F4.11 refinar billing)
- Validação server-side no upload e ao salvar metadados

## Segurança (`docs/SECURITY.md`)

| Item | Status |
| --- | --- |
| RLS por conta + visibilidade por item | ✅ |
| Authz server-side (admin envia/exclui; viewer/cuidador só autorizados) | ✅ |
| Upload MIME/tamanho + bucket privado + path servidor | ✅ |
| URLs assinadas curta duração | ✅ |
| Logs sem PHI (IDs + tipo nos fluxos) | ✅ mínimo |
| elder-access / SOS / WA / billing / OCR | N/A |

## Arquivos principais

- `apps/web/modules/exams/**` — domínio, application, infrastructure, presentation
- `apps/web/app/(family)/familia/exames/page.tsx`
- `apps/web/app/api/exams/upload/route.ts`
- `apps/web/app/(public)/l/[token]/page.tsx`
- `apps/web/content/family.ts` — seção `exames`
- Integração Hoje: `onboarding-checklist.ts`, `get-hoje-dashboard.ts`, `hoje-checklist-card.tsx`

## Reflexão (escalabilidade / manutenibilidade)

O módulo `exams` segue o padrão vertical já usado em `agenda` e `medications`: regras puras testáveis no domínio, agregador `get-exames-page` na application, repos Supabase/Storage isolados e UI client mínima (modais, busca/filtro). A autorização por documento fica na tabela `exam_member_access` espelhada na RLS, o que escala para dezenas de membros sem alterar a matriz global de papéis. O upload em duas etapas (blob → metadados) evita órfãos via cleanup na falha de save.

Próximos passos naturais: homologação manual FL-08, `db:push` remoto, e em F4.11 barra de uso de armazenamento + plano real; F4.9 pode agregar eventos de upload ao feed de avisos.

## Homologação pendente

- Smoke manual cenários 1–39 via skill `manual-report` (FL-08 parcial)
