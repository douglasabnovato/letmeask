# Deploy · Letmeask

> Revisto em 16/11/2026. O front é estático (Vite) e o backend é o Firebase (Authentication com Google e Realtime Database, plano gratuito Spark). Tudo o que pede conta, Variable ou Settings é do responsável; cada passo tem issue com `depende-do-responsavel`.

## 1. Estado em 16/11/2026

| Endereço | Resposta | O que serve |
|---|---|---|
| https://letmeask-aulas.web.app | 200 | Build antiga, do Create React App (`<html lang="en">`, `/static/js/`). Não é a versão atual (#12) |
| https://douglasabnovato.github.io/letmeask/ | 404 | Pages desligado |

Comando: `curl -s -o /dev/null -w "%{http_code}" <endereço>`, em 16/11/2026.

## 2. Caminhos de publicação

| Caminho | Arquivo | Quem dispara | Estado |
|---|---|---|---|
| **GitHub Pages por Actions** (preferido no plano de 03/11) | `.github/workflows/pages.yml` | push na `main`, depois que o CI (`raiz`, `regras`, `e2e`) passou no PR | Preparado. Parado até a Variable `PAGES_VIA_ACTIONS=true` (#17) |
| Firebase Hosting | `firebase.json` (`hosting`) e `npm run deploy` | o responsável, do computador dele | Manual. Serve a build antiga hoje (#12) |

O `pages.yml` substitui o modelo antigo `ci/github-actions-ci.yml`, que saiu em 16/11/2026. O modelo juntava teste e deploy num job `web`, que não bate com os checks exigidos pelo ruleset (`raiz` e `regras`). Agora o teste fica no `ci.yml` e a publicação no `pages.yml`. Sem a Variable, os jobs do `pages.yml` aparecem como pulados, sem CI vermelho.

Ajustes que o build do Pages já tem:
- `npm run build:pages`: `vite build --base=/letmeask/` e cópia de `build/index.html` para `build/404.html`, para os links diretos (`/letmeask/rooms/<id>`).
- `BrowserRouter basename` vem de `import.meta.env.BASE_URL` (`src/App.tsx`).
- O modo emulador (`VITE_FIREBASE_EMULATORS=true`) só existe nos testes. Ele recusa projeto que não começa com `demo-`, então não liga num projeto real por engano.

## 3. Passo a passo do responsável

### Etapa 1 · Firebase (issue #12)

1. Abra o [console do Firebase](https://console.firebase.google.com) e o projeto `letmeask-aulas` (o do `.firebaserc`).
2. **Authentication → Sign-in method → Google**: confira que está **Ativado**.
3. **Authentication → Settings → Authorized domains → Add domain**: `douglasabnovato.github.io`. O `localhost` e o `letmeask-aulas.web.app` já vêm na lista.
4. **Realtime Database → Regras**: as regras devem ter `auth.uid`, iguais às do `database.rules.json`. Se não estiverem, no seu computador:
   ```bash
   npx firebase-tools login
   npx firebase-tools deploy --only database
   ```
5. **Configurações do projeto (engrenagem) → Geral → Seus apps → app Web → Configuração do SDK**: copie os 7 valores. Eles são públicos (vão no JavaScript do site); quem protege os dados são as regras do banco.

### Etapa 2 · Variables do repositório (issue #17)

1. GitHub → repositório `letmeask` → **Settings → Secrets and variables → Actions → aba Variables → New repository variable**.
2. Crie uma por vez, com os valores da Etapa 1, passo 5:
   `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_DATABASE_URL`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`.
3. Crie por último `PAGES_VIA_ACTIONS` com o valor `true`.

### Etapa 3 · Ligar o Pages (issue #17)

1. **Settings → Pages → Build and deployment → Source**: escolha **GitHub Actions**.
2. **Actions → Pages → Run workflow** (branch `main`), ou espere o próximo merge na `main`.
3. Os jobs `build` e `deploy` ficam verdes. O `deploy` mostra o endereço `https://douglasabnovato.github.io/letmeask/`.

### Etapa 4 · Conferir no ar

1. `curl -s https://douglasabnovato.github.io/letmeask/ | grep -o '<html lang="[^"]*"'` mostra `<html lang="pt-BR">`.
2. No navegador: "Crie sua sala com o Google" abre o popup e volta logado, sem `auth/unauthorized-domain`.
3. Crie uma sala. A URL vira `/letmeask/admin/rooms/<id>`, e o F5 continua na sala.
4. Em outra janela anônima, com outra conta, abra `/letmeask/rooms/<id>` e pergunte. A pergunta aparece na janela do dono sem recarregar.
5. Registre a data e o resultado na #14 e no `docs/MVP.md`.

### Etapa 5 · Firebase Hosting (alternativa ou desligar)

- Para manter o Firebase Hosting com a versão atual: `npm run deploy` (build com base `/` e `firebase deploy`).
- Para ficar só com o Pages: `npx firebase-tools hosting:disable`, que tira do ar a build antiga de `letmeask-aulas.web.app`.

### Etapa 6 · Proteções recomendadas (issues abertas neste ciclo)

- Restringir a `apiKey` por referenciador HTTP no Google Cloud Console.
- Exigir o check `e2e` no ruleset `principal-protegida`.
- Ligar os alertas do Dependabot.

Os números das issues estão no README, na seção "Estado e próximos passos".

## 4. Limites do plano gratuito

- Realtime Database (Spark): 1 GB guardado, 10 GB/mês de download e 100 conexões simultâneas. Basta para salas pequenas.
- O GitHub Pages exige repositório público.
- Cada pergunta grava o nome e a foto da conta Google de quem perguntou, visíveis a quem abre a sala. É o produto. Não há outro dado pessoal.
- Salas antigas sem `authorId` igual a um uid ficam só para leitura com as regras atuais.

## 5. Testes que protegem a publicação

| Comando | O que prova | Onde roda |
|---|---|---|
| `npm test` | 15 testes de interface e de unidade (Vitest, Firebase simulado) | job `raiz` |
| `npm run test:rules` | 9 testes das regras do banco no emulador (precisa de Java 21) | job `regras` |
| `npm run test:e2e` | Fluxo completo no Chromium, com duas contas, nos emuladores de Auth e de banco, com axe em cada tela (desktop 1280 px e celular 375 px) e teclado | job `e2e` |
