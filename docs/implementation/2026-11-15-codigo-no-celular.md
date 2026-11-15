# Código no celular — colar e botão do e-mail

- Data: 2026-11-15
- Spec: [`specs/2026-11-15-codigo-no-celular.md`](../../specs/2026-11-15-codigo-no-celular.md)
- Autonomia: `tight`

## O que entrou

- O campo do código deixa de ser invisível (`opacity: 0`) e não corta a colagem no `maxLength` antes de tirar espaços. Código copiado com espaço (`9 2 5 0 6 9 0 6`) vira os oito dígitos.
- Botão **Colar código** em entrar e em cadastro. Se o celular negar a leitura, a mensagem pede o toque longo. O código já preenchido não é apagado.
- Botão do e-mail passa a abrir `/auth/confirm` com `token_hash`. A sessão vai no mesmo redirect para `/familia`, `/cadastro` ou `/entrar` (seletor).
- A home que receber `code` ou `token_hash` na query encaminha para a rota de auth. Tipo `recovery` fica na home.
- Fragmento `#access_token` na home grava a sessão e segue para `/auth/session`.
- Link inválido abre `/entrar` com aviso. O aviso some quando a pessoa já está na tela do código.

## Verificação

- `pnpm typecheck`, `pnpm lint` (0 erros; aviso antigo em `location-actions.ts`), `pnpm test` (483)
- No navegador local: colar `9 2 5 0 6 9 0 6` preenche as casas e libera Entrar; Colar código sem permissão mostra o aviso e mantém o que já foi colado; `/?code=` inválido e `/auth/confirm` com token inválido caem em `/entrar`; `type=recovery` não sai da home
- Celular real (Mail/Gmail, toque longo) ainda não homologado

## Segurança (`docs/SECURITY.md`)

- A07: o código continua no Supabase; o botão usa token de uso único, não o número na URL. Tipos aceitos: `email`, `magiclink`, `signup`
- Destino só `/familia`, `/cadastro`, `/entrar`
- Cookie da conta: httpOnly, SameSite=Lax, Secure em produção
- Sem PHI no aviso de falha. O token não é logado pela aplicação; a URL da requisição ainda pode aparecer no log da plataforma (token de uso único)
- N/A: RLS, upload, webhook, SOS, elder-access

## Operação

O HTML novo está em `docs/emails/`. O botão em produção só muda depois de colar o template no Dashboard do Supabase e pedir um e-mail novo. Site URL sem barra no final.
