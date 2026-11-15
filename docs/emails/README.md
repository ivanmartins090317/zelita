# E-mails Auth — Zelita

Templates HTML para colar no **Supabase Dashboard → Authentication → Email Templates**.

## Remetente (nome do e-mail)

Com o provedor embutido do Supabase o remetente técnico continua `noreply@mail.app.supabase.io`, mas o **nome de exibição** pode ser “Zelita”.

1. **Authentication → Emails** (ou **Project Settings → Authentication**)
2. Em **Sender name** / nome do remetente: `Zelita`
3. Ideal em produção: **SMTP customizado** (Resend, Brevo…) com:
   - Sender name: `Zelita`
   - Sender email: ex. `nao-responda@seudominio.com`

## Logo no e-mail

O HTML aponta para a URL pública do app:

`https://zelita-web.vercel.app/brand/zelita-mark.png`

Arquivo no repo: `apps/web/public/brand/zelita-mark.png` (deploy na Vercel necessário para o logo aparecer).

## Templates deste pasta

| Arquivo | Colar em (Supabase) |
| --- | --- |
| `magic-link.html` | **Magic Link** (login OTP + link) |
| `confirm-signup.html` | **Confirm signup** (1ª vez, se Confirm email estiver ligado) |

Assuntos sugeridos:

- Magic Link: `Seu código Zelita`
- Confirm signup: `Confirme seu e-mail — Zelita`

## Comprimento do código (6 vs 8 dígitos)

O **número de dígitos** do `{{ .Token }}` vem do **Supabase Auth**, não do template HTML nem do app.

| Onde | O que fazer |
| --- | --- |
| **Dashboard** | [Authentication → Sign In / Providers → Email](https://supabase.com/dashboard/project/xfrmbckdgojrpvprvnwg/auth/providers?provider=Email) |
| **Campo** | **Email OTP length** → definir **6** (padrão Zelita / PRD) |
| **Depois** | Salvar e pedir **um código novo** — e-mails já enviados não mudam |

Projetos Supabase mais novos costumam vir com **8 dígitos** por padrão. O app aceita **6 a 8** na digitação, mas o copy e a UX assumem **6** — alinhe o Dashboard para evitar confusão.

## Botão do e-mail

O botão não usa mais `{{ .ConfirmationURL }}`. Esse endereço caía na home e não criava sessão.

O href do template aponta para o app:

`{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

(no HTML, `&` vira `&amp;`.)

- **Site URL** sem barra no final: `https://zelita-web.vercel.app`
- O código (`{{ .Token }}`) continua no e-mail para quem preferir colar
- Tocar no botão consome o código. Se o link falhar, a pessoa pede outro ou cola o que ainda estiver válido

## Variáveis Supabase usadas

- `{{ .Token }}` — código OTP (6–8 dígitos, conforme Auth do Supabase)
- `{{ .TokenHash }}` — token de uso único do botão, válido em outro navegador (Gmail no celular)
- `{{ .SiteURL }}` — origem do app, sem barra no final
- `{{ .Email }}` — e-mail do destinatário (opcional no corpo)

## Depois de colar

1. Salve cada template no Dashboard — **sem este passo o botão continua abrindo a home**
2. Confirme Site URL sem barra no final
3. Peça **um** e-mail novo (templates antigos não mudam e-mails já enviados)
