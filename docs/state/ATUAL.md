# Em execução

| Campo | Valor |
| --- | --- |
| Etapa | **F3 · Cadastro** — Done técnico; aguardando homologação manual FL-02 |
| Spec | `specs/2026-08-12-f3-cadastro.md` (aprovada) |
| Autonomia | `medium` |
| Status | Wizard 8 passos em `/cadastro`; persistência única no passo 8 |

## Feito nesta sessão

- [x] Wizard `/cadastro` (8 passos) — OTP reutiliza F2; copy em `content/signup.ts`
- [x] Persistência única via `complete-signup` (perfil + conta + pessoa cuidada + Casa)
- [x] `/onboarding` → redirect `/cadastro`; login-routing incompleto → `/cadastro`
- [x] Passo 7 convites só locais; passo 8 sem gateway (trial 30 / Cuidado+ 60 dias)
- [x] Vitest: message-preview, signup-routing, content/signup; login-routing atualizado
- [x] Entrega em `docs/implementation/2026-08-12-f3-cadastro.md`

## Próximo

Homologação manual F3 (skill `manual-report`, FL-02) + review humano paths críticos (auth, bootstrap, persistência).
