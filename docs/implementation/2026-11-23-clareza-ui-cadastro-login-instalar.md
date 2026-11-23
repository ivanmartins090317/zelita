# Clareza de UI: endereço, OTP, entrada e instalar

- Data: 2026-11-23
- Spec: pedido direto nesta conversa (quatro ajustes de clareza vindos da homologação no celular)
- Autonomia: `tight` — toca `app/(auth)`/`accounts` (entrada e OTP) e `elder-access` (instalar); pede review do Ivan

## O que entrou

### 1. Endereço de casa em campos separados (cadastro, passo de contato)

Antes era um campo único de linha só, ilegível no celular. Agora: Rua · Número + Complemento · Bairro · Cidade + Estado (seletor de UF), com validação e erro por campo e `autocomplete` de endereço.

O banco não mudou: `formatSignupAddress` monta a linha única que `complete-signup` já grava em `address_text` (ex.: `Rua 9 de Julho, 73 - apto 91 - Embaré - Santos - SP`). Lógica nova em `signup-address.ts`, com teste próprio.

### 2. OTP com seis casas numa linha só

A caixa reservava 8 casas e quebrava em 4+4 no celular. `resolveAccessCodeBoxLength()` agora devolve 6 (`ACCESS_CODE_LENGTH`) e a grade é `grid-cols-6` sem quebra. Dígito além da sexta casa não entra mais invisível no valor (digitado ou colado). O servidor segue aceitando 6–8 dígitos (`ACCESS_CODE_MAX_LENGTH` intacto).

### 3. Tela de entrada: entrar ≠ criar conta

“Que bom te ver de novo” assumia usuário recorrente e o cadastro ficava como botão secundário atrás de um “ou”. Agora: título neutro **Entrar na Zelita**, subtítulo começa com “Já tem conta?”, e o cadastro tem bloco destacado próprio — “Primeira vez aqui? · 30 dias grátis, sem cartão de crédito · Criar minha conta grátis” (reusa a promessa da landing).

### 4. Instalar no celular dele

O card “Nenhum aparelho vinculado” com corpo vazio virou linha de status compacta (ponto indicador + Desvincular quando houver aparelho). As duas opções de envio deixaram de ser cards soltos e viraram respostas a uma pergunta única — **Como o link chega até ele?** — num card só: “Estou longe dele” (botão primário; WhatsApp mascarado no texto de apoio) e “Estou com o celular dele aqui” (secundário). Nenhuma action, canal ou regra de link mudou; só apresentação e copy.

## Arquivos tocados

- `content/signup.ts` · `content/login.ts` · `content/family.ts` — copy e interfaces
- `modules/care-recipients/presentation/`: `signup-address.ts` (novo, com `.test.ts`), `signup-contact-step.tsx`, `signup-types.ts`, `signup-form-helpers.ts`, `signup-form-steps.tsx`
- `lib/format/otp.ts` (+ teste) · `components/ui/access-code-input.tsx`
- `modules/accounts/presentation/login-form.tsx`
- `modules/elder-access/presentation/install-device-panel.tsx`

## Verificação

- `pnpm typecheck`, `pnpm lint` (0 erros; aviso antigo em `location-actions.ts`), `pnpm test` (490, inclui os novos de `signup-address`)
- Visual: `/entrar` conferido em 390px (dois caminhos distintos); passo de contato e instalar via hot reload no dev local

## Segurança (`docs/SECURITY.md`)

- Auth: nenhuma mudança em verificação, cooldown ou sessão; o padrão do servidor segue `^\d{6,8}$`
- Elder-access: emissão, canal, validade e revogação de link intactos; mudança só de apresentação
- Endereço: segue para o mesmo `address_text` via server action já validada por Zod; nada novo logado no Sentry
- N/A: RLS, webhooks, uploads, billing

## Reflexão

O endereço ganhou um módulo próprio (`signup-address.ts`) em vez de inchar o step: o formato da linha única fica num lugar só, e migrar para colunas de verdade no banco (se o SOS precisar de endereço estruturado) vira troca de uma função. O OTP centralizou o tamanho da caixa em `resolveAccessCodeBoxLength()`, então um projeto que emita 8 dígitos ajusta uma constante. O risco a vigiar é copy: três arquivos de content cresceram juntos nesta fatia e a validação de UF é client-side por lista fixa — se o Brasil ganhar UF nova, é um array.
