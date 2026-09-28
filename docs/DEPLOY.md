# Deploy · Letmeask

Plano de ação para publicar as salas de perguntas ao vivo em hospedagem gratuita.

## 1. Desafio

Publicar uma SPA React (Vite + React Router 7) cujo backend é o Firebase (Authentication com Google + Realtime Database), com as **regras novas do banco publicadas** (as antigas deixavam qualquer usuário logado apagar ou encerrar salas alheias), chaves fora do Git e publicação automática, sem custo.

## 2. Conteúdo

### Decisão de hospedagem

O "backend" é o próprio Firebase (Auth + Realtime Database): o front é só arquivo estático e pode ficar em qualquer hospedagem estática.

| Opção | Resultado |
|---|---|
| **GitHub Pages publicado pelo GitHub Actions (escolhida, preferência do usuário)** | CI testa, valida as regras no emulador, faz o build com as Variables e publica. Exige 2 ajustes: `base` `/letmeask/` + `basename` no roteador e `404.html` para os links diretos (`/rooms/:id`) |
| Firebase Hosting (`npm run deploy`, plano Spark) | Continua como alternativa. Vantagens: mesmo projeto do banco, domínio já autorizado no login Google e reescrita de rotas nativa (`firebase.json`). Desvantagem: publicação manual pelo seu computador |

Por que o Pages é viável aqui:

- **Rotas do React Router:** o GitHub Pages não reescreve rotas. O build do Pages gera `404.html` (cópia do `index.html`): quem abre `/letmeask/rooms/abc` recebe o app, que mostra a sala certa. O status HTTP dessa primeira resposta é 404, sem efeito para quem usa (o app não depende de SEO).
- **Login com Google:** usa `signInWithPopup` com o `authDomain` do Firebase, que funciona fora do Firebase Hosting desde que **`douglasabnovato.github.io` esteja em Authentication → Settings → Authorized domains**. Sem isso, o popup mostra `auth/unauthorized-domain`.
- **Chaves:** a configuração web do Firebase vai dentro do JavaScript publicado em qualquer hospedagem; por isso fica em **Variables** do repositório (não Secrets). Quem protege os dados são as regras do banco.

### O que foi ajustado

| Mudança | Arquivo | Por quê |
|---|---|---|
| Script `build:pages`: `vite build --base=/letmeask/` + cópia de `build/index.html` para `build/404.html` | `package.json` | O `npm run build` (base `/`) segue servindo o Firebase Hosting; o Pages usa o subcaminho `/letmeask/` e precisa do `404.html` para links diretos |
| `BrowserRouter basename` = `import.meta.env.BASE_URL` (sem a barra final) | `src/App.tsx` | Vazio no Firebase Hosting, `/letmeask` no Pages; as rotas continuam `/rooms/:id` no código |
| Build com as Variables, upload de `build/` e job `deploy` (configure-pages, deploy-pages) só em push na `main`; Node 20 → 22 | `ci/github-actions-ci.yml` → `.github/workflows/ci.yml` | Publicação automática depois de testes, regras e build verdes |
| Seção "Em produção" e tabela de comandos | `readme.md` | URL, hospedagem e este guia |

Conferido num navegador headless servindo o build como o Pages serve: `/letmeask/` abre a Home, `/letmeask/rooms/abc123` abre a sala direto e `/letmeask/qualquer/coisa` mostra "Página não encontrada".

### Variables do repositório (Settings → Secrets and variables → Actions → aba Variables)

Os mesmos valores do seu `.env` (Console do Firebase → Configurações do projeto → Seus apps → app Web):

`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.

Sem `VITE_FIREBASE_API_KEY` ou `VITE_FIREBASE_DATABASE_URL`, o site publicado mostra a tela "Configuração pendente".

### Limitações e pontos de atenção

- **Plano Spark (gratuito):** Realtime Database com 1 GB armazenado, 10 GB/mês de download e 100 conexões simultâneas; suficiente para salas de Q&A pequenas. O GitHub Pages exige repositório público.
- **Salas antigas:** as que não têm `authorId` igual a um uid ficam somente leitura com as regras novas; ajuste pelo console ou recrie.
- **Dados pessoais:** cada pergunta grava nome e foto da conta Google de quem perguntou, visíveis a quem abre a sala (é o produto). Não há outro dado pessoal.
- **Chave da API:** recomendado restringir a `apiKey` por referenciador HTTP no Google Cloud Console (APIs e serviços → Credenciais) a `https://douglasabnovato.github.io/*`, `https://letmeask-aulas.web.app/*`, `https://letmeask-aulas.firebaseapp.com/*` e `http://localhost:5173/*`.
- **Validação feita aqui:** `npm ci` limpo, 6 testes de interface passando, `tsc` + build (`build` e `build:pages`) ok, `npm audit` com 0 vulnerabilidades. O `npm run test:rules` **não rodou** na sandbox (o download do emulador do Realtime Database foi bloqueado pela rede); rode no seu computador na Etapa 0 — o CI também roda.

### Arquivos que saem do Git

`public/index.html`, `src/index.tsx`, `src/react-app-env.d.ts`, `yarn.lock`, `src/assets/images.zip` e as cópias duplicadas em `src/assets/` (os usados ficam em `src/assets/images/`; `avatar-user.jpeg` não é importado por nenhum arquivo). Comandos na Etapa 2.

## 3. Solução (passo a passo)

Branch principal: **`main`**.

### Etapa 0 · Segurança: publicar as regras novas do banco

1. No Git Bash:
   ```bash
   cd /c/ambiente-projeto/ser-mvp/letmeask
   npm install
   cp .env.example .env   # preencher com as chaves do projeto (variáveis agora começam com VITE_FIREBASE_)
   npm run test:rules     # precisa de Java 11+; baixa o emulador na 1ª vez
   npx firebase-tools login
   npx firebase-tools deploy --only database
   ```
   O projeto usado é o do `.firebaserc` (`letmeask-aulas`).
2. Console do Firebase → **Realtime Database → Regras**: conferir que aparecem as regras com `auth.uid` (as mesmas de `database.rules.json`).
3. **Authentication → Settings → Authorized domains → Add domain**: `douglasabnovato.github.io`.

### Etapa 1 · Validar localmente (Git Bash)

1. `cd /c/ambiente-projeto/ser-mvp/letmeask`
2. `npm test` (esperado: 6 testes)
3. `npm run dev` → `http://localhost:5173`: entrar com o Google, criar sala, perguntar em outra aba anônima, curtir, destacar, marcar como respondida e encerrar.
4. `npm run build:pages && npx vite preview --base=/letmeask/` → abrir `http://localhost:4173/letmeask/` e navegar até uma sala.

### Etapa 2 · Cadastrar as Variables e subir para o GitHub

1. Repositório → **Settings → Secrets and variables → Actions → Variables**: criar as 7 variáveis `VITE_FIREBASE_*` com os valores do `.env`.
2. Remover os arquivos substituídos:
   ```bash
   git rm public/index.html src/index.tsx src/react-app-env.d.ts yarn.lock src/assets/images.zip
   git rm src/assets/answer.svg src/assets/avatar-user.jpeg src/assets/check.svg src/assets/copy.svg src/assets/delete.svg src/assets/empty-questions.svg src/assets/google-icon.svg src/assets/illustration.svg src/assets/like.svg src/assets/logo.svg
   ```
3. Ativar o CI:
   ```bash
   mkdir -p .github/workflows && mv ci/github-actions-ci.yml .github/workflows/ci.yml && rmdir ci
   ```
4. `git status` (não podem aparecer `.env`, `build/`, `.firebase/` nem `node_modules/`)
5. `git add -A`
6. `git commit -m "feat(deploy): Vite 8, regras do banco corrigidas e publicação no GitHub Pages por Actions"`
7. `git push origin main`

### Etapa 3 · Configurar o GitHub Pages

1. **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. Aba **Actions**: se o workflow do push já tiver terminado, **Re-run all jobs**. Os jobs `web` e `deploy` precisam ficar verdes.

### Etapa 4 · Conferir no ar

1. `https://douglasabnovato.github.io/letmeask/` abre a Home (não a tela "Configuração pendente").
2. "Crie sua sala com o Google" abre o popup e volta logado (sem `auth/unauthorized-domain`).
3. Criar uma sala: a URL vira `/letmeask/admin/rooms/<id>`; dar F5 continua na sala.
4. Abrir `/letmeask/rooms/<id>` em aba anônima, entrar com outra conta e perguntar: a pergunta aparece na aba do dono em tempo real.
5. A conta que não é dona não consegue encerrar a sala (os botões de moderação não aparecem).

### Etapa 5 · Fechar

1. Alternativa (Firebase Hosting): `npm run deploy` (build com base `/` + `firebase deploy`; precisa do Firebase CLI: `npm i -g firebase-tools`, ou rode `npm run build && npx firebase-tools deploy --only hosting`). A URL é `https://letmeask-aulas.web.app`. Se ficar só com o Pages, o site antigo do Firebase Hosting continua no ar com a versão velha: desative com `npx firebase-tools hosting:disable`.
2. No GitHub, **About → Website**: `https://douglasabnovato.github.io/letmeask/`.
