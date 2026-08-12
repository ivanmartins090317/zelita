# Spec: <Nome da Feature>

- Status: `draft` | `aprovada` | `em_implementacao` | `done`
- Data: YYYY-MM-DD
- Autonomia: `tight` | `medium` | `loose`
- Projeto:
- Pedido original:

## 1. Objetivo

Em 1–3 frases: qual resultado de negócio essa feature entrega.

## 2. Fora de escopo

Liste o que NÃO entra agora.

## 3. Atores e pré-condições

- Quem usa:
- O que precisa existir antes:

## 4. Comportamento esperado (cenários)

Escreva em linguagem de domínio. Evite leakage técnico (`POST /api/...`, nome de tabela, nome de classe).

### Cenário 1: <caminho feliz>

- Dado:
- Quando:
- Então:

### Cenário 2: <erro / borda>

- Dado:
- Quando:
- Então:

### Cenário 3: <outro caso importante>

- Dado:
- Quando:
- Então:

## 5. Regras de negócio

- Regra 1:
- Regra 2:

## 6. Critérios de Done desta feature

- [ ] Todos os cenários acima passam
- [ ] Testes unitários da feature passam
- [ ] `typecheck` passa
- [ ] `lint` passa
- [ ] Checklist aplicável de `docs/SECURITY.md` (itens N/A justificados)
- [ ] Nenhuma mudança fora do escopo sem aprovação

## 7. Escopo de arquivos permitido

- Pode editar:
  - `apps/web/modules/<modulo>/**`
  - rotas/UI da mesma fatia em `apps/web/app/(…)/`
- Não pode editar sem pedido (paths críticos):
  - `apps/web/modules/**/domain/**`, `accounts`, `billing`, `elder-access`, `sos`
  - `supabase/migrations/**`, `supabase/policies/**`, auth, `.env*`

## 8. Riscos e dúvidas abertas

- Segurança (RLS, authz, webhook, elder-access, PHI):
- Outros:

## 9. Aprovação humana

- Aprovado por:
- Data:
- Observações:
