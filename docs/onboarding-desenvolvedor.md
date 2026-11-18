# Entrar no time da Zelita

Guia para quem vai desenvolver a Zelita no mesmo nível de quem já está no projeto: baixar o código, instalar, subir o app na máquina e enviar mudanças pelo GitHub.

Repositório: [github.com/ivanmartins090317/zelita](https://github.com/ivanmartins090317/zelita)

A Zelita é um SaaS de coordenação familiar para cuidado de idosos. O familiar usa o painel. A pessoa cuidada recebe lembretes e SOS sem criar login.

---

## Parte 1 — Quem convida (fazer uma vez)

O repositório está na conta pessoal `ivanmartins090317`. No GitHub, conta pessoal tem **um** dono. A pessoa convidada, como colaboradora, consegue clonar, criar branch, commitar, abrir pull request e fazer merge. Isso cobre o dia a dia de desenvolvimento no mesmo nível prático.

O dono da conta continua sendo a única pessoa que apaga o repositório, muda de privado para público e convida outras pessoas. Se as duas pessoas precisam ser donas também dessas configurações, siga a [Parte 1-B](#parte-1-b--as-duas-pessoas-como-donas-organizacao).

### 1. Peça o usuário do GitHub

Ela cria a conta em [github.com/signup](https://github.com/signup) e te envia o **username** (o nome que aparece na URL `github.com/NOME`). O username é mais seguro do que o e-mail para o convite.

### 2. Envie o convite de colaboradora

1. Abra [github.com/ivanmartins090317/zelita/settings/access](https://github.com/ivanmartins090317/zelita/settings/access).
2. Em **Collaborators** (ou **Collaborators and teams**), clique em **Add people**.
3. Digite o username dela e confirme **Add ivanmartins090317/zelita to this repository** / **Add to repository**.
4. Em repositório de conta pessoal o GitHub concede **escrita**: ela pode enviar código e fazer merge. Se aparecer um seletor de papel, escolha **Admin** só se a intenção for ela também alterar configurações do repositório.

O convite vale por 7 dias. Se expirar, repita o passo 2.

### 3. Confirme que ela aceitou

Ela abre o e-mail do GitHub ou a página [github.com/notifications](https://github.com/notifications) e clica em **Accept invitation**.

Teste rápido, feito por ela:

```bash
gh repo view ivanmartins090317/zelita
```

Se o comando mostrar o repositório, o acesso está ok. Se aparecer `not found`, o convite ainda não foi aceito ou o username está errado.

### 4. Entregue o ambiente local em canal privado

O arquivo com senhas e chaves **não está no Git**. Envie para ela, por WhatsApp, e-mail direto ou gerenciador de senhas:

- o arquivo preenchido, para ela salvar como `apps/web/.env.local`
- o link deste guia

Ela precisa destas variáveis para entrar no painel em localhost:

- `NEXT_PUBLIC_APP_URL` = `http://localhost:3000`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

WhatsApp, Inngest, Sentry e Resend podem ficar vazios enquanto ela só mexe em tela e fluxo local. O modelo vazio está em `.env.example` na raiz.

Esse `.env.local` aponta para o banco que o time já usa. Os dados lá são reais para o projeto: combine antes de apagar conta, pessoa cuidada ou remédio.

### 5. Outros acessos, se ela for operar além do código

| Ferramenta | Para quê | Quando conceder |
| --- | --- | --- |
| GitHub (colaboradora) | Código, PR e merge | Sempre |
| Supabase do projeto | Ver tabelas e usuários de teste | Quando ela for depurar dados |
| Vercel | Deploy | Quando ela for publicar |
| Inngest, Sentry, Resend, Meta | Jobs, erros, e-mail, WhatsApp | Quando a tarefa usar esse canal |

### Parte 1-B — As duas pessoas como donas (organização)

Use isto quando as duas precisam convidar gente, mudar visibilidade e administrar o repositório com o mesmo papel.

1. Em [github.com/account/organizations/new](https://github.com/account/organizations/new), crie uma organização (plano Free atende um time pequeno).
2. Convide a outra pessoa como **Owner** da organização.
3. No repositório, abra **Settings → General → Danger zone → Transfer ownership** e transfira `zelita` para a organização.
4. As duas continuam **Owner** da organização. A URL do repositório muda. Avise o time e atualize o clone com o novo endereço que o GitHub mostrar depois da transferência.

Faça a Parte 1 (convite na conta pessoal) primeiro se ela precisa começar esta semana. A transferência para organização pode ser o passo seguinte, com as duas combinando o nome da organização.

---

## Parte 2 — Primeira vez na máquina (desenvolvedora)

Faça os blocos na ordem. No fim de cada bloco está o que deve aparecer.

Sistema assumido: **Windows 10 ou 11**, com PowerShell. No Mac, os mesmos programas existem; o instalador muda (Homebrew ou o site oficial) e o terminal é o Terminal ou o iTerm.

### Bloco A — Programas

1. **Git.** Baixe em [git-scm.com/download/win](https://git-scm.com/download/win) e avance o instalador com as opções padrão. Ele serve para baixar o projeto e enviar commits.
2. **Node.js 20 ou mais novo (LTS).** Baixe em [nodejs.org](https://nodejs.org/) a versão LTS. O projeto recusa Node antigo (`engines.node` é `>=20` no `package.json` da raiz).
3. **pnpm 9.15.9.** É o instalador de bibliotecas deste repositório. Use este, no lugar de `npm install` na raiz. Abra o PowerShell e rode:

```powershell
node -v
git --version
corepack enable
corepack prepare pnpm@9.15.9 --activate
pnpm -v
```

`node -v` precisa mostrar `v20` ou maior. `pnpm -v` precisa mostrar `9.15.9`.

Se `corepack` responder que não existe, feche o PowerShell, abra de novo e repita. Se ainda falhar:

```powershell
npm install -g pnpm@9.15.9
pnpm -v
```

4. **GitHub CLI** (facilita login e pull request). No PowerShell:

```powershell
winget install --id GitHub.cli
```

Feche e abra o PowerShell. Depois:

```powershell
gh auth login
```

Escolha: **GitHub.com** → **HTTPS** → autenticar no navegador. Entre com a conta que recebeu o convite.

Sucesso: `gh auth status` mostra a sua conta logada.

### Bloco B — Aceitar o convite e baixar o código

1. Aceite o convite (e-mail ou sino de notificações do GitHub).
2. Crie uma pasta fora do OneDrive e do Drive, de preferência sem espaço no caminho. Exemplo: `C:\projetos`.
3. No PowerShell:

```powershell
cd C:\projetos
gh repo clone ivanmartins090317/zelita
cd zelita
```

Isso cria a pasta `C:\projetos\zelita` com o código e a branch `main` ligada ao GitHub.

Sucesso: `git status` mostra `On branch main` e working tree clean.

O endereço HTTPS equivalente, se preferir o Git sem o `gh`:

```powershell
git clone https://github.com/ivanmartins090317/zelita.git
```

### Bloco C — Chaves locais e bibliotecas

1. Salve o arquivo que a outra pessoa do time enviou em:

`apps/web/.env.local`

Se você ainda for preencher à mão, copie o modelo e edite:

```powershell
Copy-Item .env.example apps\web\.env.local
notepad apps\web\.env.local
```

2. Na **raiz** do projeto (a pasta que contém `package.json` e `apps`), instale as bibliotecas:

```powershell
pnpm install
```

A primeira vez pode levar alguns minutos. A pasta `node_modules` fica na sua máquina e não vai para o GitHub.

3. Suba o site local:

```powershell
pnpm dev
```

4. Abra [http://localhost:3000](http://localhost:3000).

Sucesso: a página da Zelita abre. Para entrar no painel, use um e-mail de teste combinado com o time (o login é por código no e-mail, via Supabase).

Pare o servidor com `Ctrl+C` no PowerShell quando for desligar.

### Bloco D — Conferir se a máquina está saudável

Na raiz, com o `pnpm dev` parado:

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

Sucesso: os três terminam sem erro. Esses são os mesmos comandos que o time usa antes de considerar uma entrega pronta.

---

## Parte 3 — Enviar uma mudança (branch, commit e pull request)

As duas pessoas podem commitar e fazer merge. O combinado do repositório é: a branch `main` recebe código por **pull request**, a partir de uma branch `feature/...`. Assim o histórico fica legível e a outra pessoa consegue ler o diff.

Você tem permissão para enviar direto na `main`. O hábito do time é a pull request mesmo assim.

### 1. Atualize a main

```powershell
git checkout main
git pull
```

### 2. Crie uma branch com o assunto

Nome curto, em inglês, com hífen. Exemplos: `feature/ajustar-menu-mobile` pode ser `feature/slim-mobile-menu`.

```powershell
git checkout -b feature/nome-curto-em-ingles
```

### 3. Faça a alteração e confira

```powershell
pnpm typecheck
pnpm lint
pnpm test
```

### 4. Commit

Mensagem no padrão [Conventional Commits](https://www.conventionalcommits.org/), em inglês, no imperativo. A primeira linha diz o tipo e o motivo.

Tipos que mais usamos: `feat` (funcionalidade), `fix` (correção), `docs` (documentação), `test`, `refactor`, `chore`.

```powershell
git add .
git status
git commit -m "feat(family): slim the mobile header"
```

Olhe o `git status` antes do commit. O arquivo `apps/web/.env.local` não pode aparecer na lista. Se aparecer, tire com:

```powershell
git restore --staged apps/web/.env.local
```

E não rode `git add .` de novo em cima dele. O `.gitignore` já ignora `.env.local`; se ele entrou na lista, algo foi forçado com `git add -f`.

### 5. Envie a branch

```powershell
git push -u origin HEAD
```

### 6. Abra a pull request

No site, o GitHub mostra o botão **Compare & pull request** depois do push. Clique, escreva o que mudou e por quê, e marque a outra pessoa como reviewer.

Pelo terminal, na mesma pasta:

```powershell
gh pr create --title "feat(family): slim the mobile header" --body "Por que esta mudança existe, em uma ou duas frases."
```

### 7. Merge

Quem revisou (ou você, se as duas combinaram que esta PR pode entrar) abre a pull request e clica em **Merge pull request**. Use **Create a merge commit**, para os commits da branch continuarem visíveis.

Depois, na sua máquina:

```powershell
git checkout main
git pull
```

Pode apagar a branch da funcionalidade no GitHub pelo botão **Delete branch**. Na máquina:

```powershell
git branch -d feature/nome-curto-em-ingles
```

### Atalho do dia a dia

| Quero | Comando |
| --- | --- |
| Ver o que mudou | `git status` e `git diff` |
| Atualizar a main | `git checkout main` e `git pull` |
| Subir o app | `pnpm dev` |
| Checar antes da PR | `pnpm typecheck`, `pnpm lint`, `pnpm test` |
| Publicar a branch | `git push` |

---

## O que ler depois que o app abrir

| Arquivo | Para quê |
| --- | --- |
| `AGENTS.md` | Contrato do repositório: pastas, o que pode mudar, definição de pronto |
| `docs/prd-mvp.md` | O que o produto faz |
| `docs/arquitetura-solucao.md` | Como o código está dividido |
| `docs/SECURITY.md` | Regras de segurança antes de dar uma feature como pronta |
| `docs/state/ATUAL.md` | O que está em andamento agora |
| `docs/stack-e-bibliotecas.md` | Next.js, Supabase, Inngest e o resto da stack |

O app vive em `apps/web`. A lógica fica em `apps/web/modules/<modulo>/`. Comandos `pnpm` rodam na **raiz**, não dentro de `apps/web`.

---

## Quando algo quebra

**`repository not found` ao clonar ou dar push.** O convite ainda não foi aceito, ou a conta do `gh auth status` é outra. Aceite o convite e rode `gh auth login` de novo com a conta certa.

**`pnpm` não é reconhecido.** Feche o terminal, abra de novo e repita o Bloco A. O Node precisa estar instalado antes do corepack.

**A página pede para configurar o Supabase.** Falta `apps/web/.env.local`, ou as chaves `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` estão vazias. Salve o arquivo, pare o `pnpm dev` e suba de novo.

**Porta 3000 ocupada.** Outro `pnpm dev` já está aberto. Feche aquele terminal ou encerre o processo que usa a porta.

**Commit recusado ou arquivo de ambiente no diff.** Pare e chame a outra pessoa antes de usar `--no-verify`, `push --force` ou `git add -f`. Force push na `main` não faz parte do fluxo.

**Dúvida de produto ou de pasta.** Leia o `AGENTS.md` da raiz e pergunte no canal do time antes de mudar schema, login, cobrança, SOS ou a área da pessoa cuidada. Essas áreas pedem revisão das duas pessoas.
