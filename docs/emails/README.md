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

## Variáveis Supabase usadas

- `{{ .Token }}` — código OTP (6–8 dígitos, conforme Auth do Supabase)
- `{{ .ConfirmationURL }}` — link mágico / confirmação
- `{{ .Email }}` — e-mail do destinatário (opcional no corpo)

## Depois de colar

1. Salve cada template no Dashboard
2. Confirme Site URL + Redirect URLs da Vercel (ver homologação Auth)
3. Peça **um** e-mail novo (templates antigos não mudam e-mails já enviados)
