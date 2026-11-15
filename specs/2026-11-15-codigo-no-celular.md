# Spec: Código no celular

- Status: `approved` (escolha no chat em 2026-11-15: botão entra direto e, se falhar, a tela de código continua colável)
- Data: 2026-11-15
- Autonomia: `tight`
- Projeto: Zelita (`apps/web`)

## 1. Objetivo

Quem entra pelo celular consegue usar o código do e-mail sem luta.

1. O botão **Entrar na Zelita** cria a sessão e abre o mesmo destino de quem digitou o código: painel, cadastro ou seletor de conta.
2. Se o link não entrar, a pessoa cola o código na tela. O toque longo funciona e existe o botão **Colar código**.

## 2. Fora de escopo

- Colocar o código numérico na URL
- Mudar o tamanho do OTP no Dashboard
- Senha, passkey ou outro método de login
- Aplicar o template no Supabase por conta do agente — o HTML fica no repositório; colar no Dashboard é passo humano

## 3. Comportamento

- Campo de código deixa de usar `opacity: 0` e não corta a colagem com `maxLength` antes de tirar espaços
- Botão Colar código lê a área de transferência. Se o celular negar, a mensagem pede o toque longo
- O mesmo campo vale em entrar e em cadastro
- Link do e-mail: `/auth/confirm?token_hash&type=email` (e `signup` no template de confirmação)
- Home que receber `code` ou `token_hash` na query encaminha para a rota de auth, em vez de ficar na landing
- Fragmento `#access_token` na home grava a sessão e segue para `/auth/session`
- Falha do link abre `/entrar` com aviso para copiar o código ou pedir outro
- Token não vai para log

## 4. Segurança

- Tipos aceitos: `email`, `magiclink`, `signup`. Recuperação e convite não passam por esta rota
- Destino só pode ser `/familia`, `/cadastro` ou `/entrar`
- Cookie de conta: httpOnly, SameSite=Lax, Secure em produção
- Sessão sai no mesmo redirect que o destino, para o celular não perder o login
