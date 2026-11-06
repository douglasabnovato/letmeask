# Plano de ação — Letmeask

Timebox: 60 min.

| MoSCoW | Item | Ganho | Esforço | Status |
|---|---|---|---|---|
| Must | Voltar a compilar: Vite, Firebase 11 compat, sass (D1) | Alto | Médio | ✅ |
| Must | Regras com `auth.uid` e sem cascata (D2) | Alto | Baixo | ✅ escrito; ⏳ executar `npm run test:rules` |
| Must | Rotas corretas e 404 (D3) | Alto | Baixo | ✅ |
| Must | Painel só para o dono (D4) | Alto | Baixo | ✅ |
| Should | Datas do servidor (D5) | Médio | Baixo | ✅ |
| Should | Estados, mensagens em pt-BR, copiar código (D6) | Médio | Baixo | ✅ |
| Should | Contraste AA, foco, aria (D7) | Médio | Baixo | ✅ axe 0 |
| Should | Testes UI + regras | Médio | Médio | ✅ 6 + 9 |
| Could | Migrar para API modular do Firebase (menor bundle) | Médio | Médio | Próximo ciclo |
| Could | Modo escuro e PWA (itens do readme original) | Baixo | Médio | Próximo ciclo |

## Riscos

- Regras não executadas aqui: rodar `npm run test:rules` antes de publicar (`firebase deploy --only database`).
- Salas antigas sem `authorId` válido ficam só leitura para todos; recrie-as ou ajuste o `authorId` pelo console.

## Ciclo de 03/11/2026

> Executado em 06/11/2026. Branch `feature/2026-11-06` → `developer/sprint-2026-11-12` → `main`. Nível: Estudo (N1), 10 critérios aplicáveis.

### Produto

**Problema e público.** Quem apresenta uma live ou aula quer receber perguntas da audiência e responder as mais pedidas. Projeto de estudo da Next Level Week Together.

**Hipótese e meta.** O apresentador cria a sala e recebe a primeira pergunta sem ajuda. Meta de estudo: fluxo completo com o Firebase real.

**O que a pesquisa trouxe.**

| Ideia | O que levamos para o projeto | Fonte |
|---|---|---|
| Moderação antes da publicação, recomendada para eventos abertos | Virou a #15: o dono aprova as perguntas antes de todos verem | [Slido: Q&A ao vivo](https://www.slido.com/features-live-qa), [AhaSlides: Q&A](https://ahaslides.com/slide-types/q-and-a/) |
| Curtidas levam as perguntas mais pedidas ao topo e evitam repetição | O Letmeask já ordena por destaque e curtidas; mantido e coberto por teste | [Airmeet: engajamento ao vivo](https://www.airmeet.com/hub/?p=126551) |
| Anonimato deixa as pessoas à vontade, mas pede moderação | Virou a #16, que depende da #15 | [Pigeonhole Live: perguntas ao vivo](https://pigeonholelive.com/features/live-questions-and-answers/) |

**Backlog priorizado (impacto × esforço).**

| Prioridade | Item | Impacto | Esforço | Destino |
|---|---|---|---|---|
| 1 | CI nos PRs para a `developer` | Alto | Baixo | Este ciclo |
| 2 | Testes das regras do banco no CI | Alto | Baixo | Este ciclo |
| 3 | Testes de falhas do Firebase (critério 6) | Médio | Baixo | Este ciclo |
| 4 | Tirar arquivos do Create React App e duplicados | Médio | Baixo | Este ciclo |
| 5 | Moderação | Médio | Médio | #15 |
| 6 | Pergunta anônima | Médio | Médio | #16 |
| 7 | Confirmar o Firebase e publicar a versão atual | Alto | Baixo | Responsável (#12) |
| 8 | Proteger a `main` | Alto | Baixo | Responsável (#13) |
| 9 | Fluxo completo com Firebase real | Alto | Baixo | Responsável (#14), depois da #12 |
| 10 | Decidir o modelo de CI com deploy | Médio | Baixo | Responsável (#17) |

**Fora do escopo.** Histórico entre eventos, enquetes, participação sem login.

### Engenharia

**Arquitetura.** SPA React 18 + TypeScript com Vite. Firebase Authentication (Google) e Realtime Database em `src/services/firebase.ts`; sala em tempo real em `src/hooks/useRoom.ts`; regras de ordenação em `src/domain/questions.ts`. Permissões no `database.rules.json`, testadas no emulador.

**Riscos.**
- O endereço publicado serve uma build antiga, do Create React App; quem abre vê a versão sem as correções da 2.0 (#12).
- O login Google só funciona com o projeto Firebase do responsável; por isso o fluxo real não foi visto (#14).
- O modelo `ci/github-actions-ci.yml` publica no Pages e espera Variables que não existem (#17).

**Qualidade.**
- Testes: 9 de interface (Vitest, Firebase simulado, inclui as falhas) e 9 de regras (emulador, job `regras`).
- CI: agora em PR e push para `developer/**`, com o job `regras` novo (Java 21 + emulador).
- Acessibilidade: axe sem violações em 2 telas (ciclo de 02/11).
- Segurança: sem alertas no `npm audit --omit=dev`; chaves do Firebase por `.env`.

**Definição de pronto.** `npm ci`, `npm test`, `npm run test:rules` e `npm run build`; CI verde no PR; `docs/MVP.md` e README atualizados.

### Plano de ação

**Este ciclo executa.**
1. CI nos PRs e pushes para `developer/**`; job `regras` com os testes do `database.rules.json`.
2. Testes de falha: sem conexão ao entrar, login cancelado e pergunta que não grava.
3. Remove `public/index.html`, `src/index.tsx`, `src/react-app-env.d.ts`, as imagens duplicadas em `src/assets/`, `images.zip`, `yarn.lock` e o cache `.firebase/`, como o `docs/DEPLOY.md` já listava. O modelo `ci/github-actions-ci.yml` fica até a #17.
4. `docs/MVP.md` com o resumo batendo com a tabela (8 de 10) e "Finalizado: sim"; README com estado e próximos passos.

**Vira issue.** #12, #13, #14 e #17 (responsável); #15 e #16 (agente).
