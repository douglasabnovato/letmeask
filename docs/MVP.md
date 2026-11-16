# MVP — letmeask

> Revisto em 16/11/2026 (ciclo de 16/11/2026, PR #21). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testes locais no Windows com Node 24 só para `npm test`, build e audit; sem Java local, os jobs `regras` e `e2e` rodaram só no CI, que roda no Ubuntu com Node 22 e Java 21. Não houve teste com pessoas nem com o Firebase real.

**Resumo:** 9 de 10 aplicáveis atendidos

**Finalizado:** sim

O que falta depende do responsável e tem issue com `depende-do-responsavel`: publicar a versão atual (#12, #17), percorrer o fluxo no Firebase real (#14) e ligar os alertas do Dependabot (#24, critério 9 em "Parcial"). O fluxo roda no navegador contra os emuladores do Firebase.

## 1. Critérios

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem apresenta ao vivo recebe as perguntas da audiência e responde as mais curtidas primeiro. | Seção 2 e README, 16/11/2026 |
| 2 | Hipótese a validar | Aposta escrita, com meta | Atende: hipótese, meta e "saberemos quando" na seção 2. Ainda não validada com pessoas (#14). | Seção 2, 16/11/2026 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Atende: `npm run test:e2e` percorre, no Chromium, o fluxo com duas contas: login Google, criar sala, entrar pelo código, perguntar, curtir, destacar, responder, encerrar e ver a sala encerrada. Roda nos emuladores de Auth e de Realtime Database, com as regras do `database.rules.json`. O Firebase real fica para a #14. | `e2e/fluxo.e2e.ts`, job `e2e` do [run 43806608521](https://github.com/douglasabnovato/letmeask/actions/runs/43806608521): 3 passed, 16/11/2026 |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. | 16/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta | Atende: código vazio ou inválido, sala inexistente ou encerrada, sem conexão, login cancelado e pergunta que não chega ao banco mostram aviso, e o texto da pergunta é mantido (Vitest, Firebase simulado). No navegador: código vazio, sala não encontrada, sala sem perguntas e sala encerrada. | `src/__tests__/app.test.tsx` (9 testes, job `raiz`) e `e2e/fluxo.e2e.ts` (job `e2e`), [run 43806608521](https://github.com/douglasabnovato/letmeask/actions/runs/43806608521), 16/11/2026 |
| 7 | Desempenho aceitável | LCP até 2,5 s no celular | Não se aplica (N1). O endereço do Firebase Hosting serve uma build antiga (#12). | Decisão 2 do processo |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 7 telas (início, nova sala, painel vazio, sala sem login, sala com pergunta, painel com pergunta e diálogo de encerrar), em desktop (1280 px) e celular (375 px), com dados criados no teste. Teclado: Tab na Home com o foco definido pelo app (contorno de 3 px), Enter envia, diálogo com foco no Cancelar, Tab preso e Esc devolvendo o foco. O app não tem tema escuro próprio (não há `prefers-color-scheme` no CSS), então o axe roda só no claro. O axe achou e o ciclo corrigiu: contraste do contador de perguntas (2,9:1 para 5,0:1), nome do botão de curtir sem o número visível e cabeçalho da sala sobreposto no celular. | `e2e/fluxo.e2e.ts` e `src/__tests__/dialog.test.tsx`, [run 43806608521](https://github.com/douglasabnovato/letmeask/actions/runs/43806608521), 16/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Parcial: audit 0 (16/11/2026); alertas do Dependabot desligados (API 403); regra em decisão na engenharia#33; ligar os alertas na #24. Sem segredo no código (`git grep` por chaves, 16/11/2026); regras do banco testadas no emulador a cada PR. Dados pessoais: nome e foto da conta Google de quem pergunta, visíveis na sala, como pede o produto; os testes usam nomes fictícios e `@empresa.test`. | `npm audit --omit=dev`, 16/11/2026: "found 0 vulnerabilities"; `gh api repos/douglasabnovato/letmeask/dependabot/alerts`, 16/11/2026: HTTP 403 "Dependabot alerts are disabled"; job `regras` do [run 43806608521](https://github.com/douglasabnovato/letmeask/actions/runs/43806608521): 9 testes |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Atende: ruleset `principal-protegida` ativo na `main` (exige PR, bloqueia force push e exclusão, exige os checks `raiz` e `regras`). O `e2e` ainda não é exigido (#22). | `gh api repos/douglasabnovato/letmeask/rulesets/26932547`, 16/11/2026 |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 15 testes Vitest (`raiz`), 9 de regras (`regras`) e 3 de navegador (`e2e`), sem nenhum `skipped` no log. | [run 43806608521](https://github.com/douglasabnovato/letmeask/actions/runs/43806608521), 16/11/2026 |
| 12 | Documentação honesta | Qualquer pessoa roda o projeto | Atende: comandos do README conferidos com o `package.json` em 16/11/2026; `docs/DEPLOY.md` com o estado real dos endereços e o passo a passo do responsável. | README e `docs/DEPLOY.md`, 16/11/2026 |

## 2. Problema e hipótese

**Problema:** em aula, palestra ou reunião ao vivo, as perguntas da audiência se perdem no chat e quem apresenta não sabe quais importam mais.

**Hipótese:** acreditamos que uma sala com código curto, login Google e curtidas leva a pergunta de quem assiste até quem apresenta, sem ajuda.

**Meta:** uma pessoa entra pelo código, pergunta e vê a pergunta destacada e respondida pelo dono, com duas contas ao mesmo tempo.

**Saberemos quando:** o teste `e2e/fluxo.e2e.ts` passar no CI em todo PR (já passa, nos emuladores) e, depois da #14, quando uma pessoa concluir o fluxo no Firebase real sem ajuda.

## 3. Fora do MVP

Moderação antes de publicar (#15), pergunta anônima (#16), histórico entre eventos e participar sem login.

## 4. Neste ciclo (16/11/2026)

- Teste de ponta a ponta no navegador com axe, nos emuladores do Firebase, e job `e2e` no CI.
- Correções que o axe e o celular acharam: contraste do contador, nome do botão de curtir, cabeçalho da sala no celular.
- Tab preso no diálogo de confirmação (padrão de diálogo modal da WAI-ARIA).
- `react-router-dom` 7.18.5; workflow do Pages parado por Variable no lugar do modelo antigo em `ci/`.

## Histórico

- 06/11/2026: declarado 9 de 10. A revisão de 16/11 contra a régua achou dois "Atende" sem a evidência pedida: o 2 (sem meta nem "saberemos quando") e o 8 (axe do ciclo de 02/11, sem teste no navegador no CI). O 3 já estava "Parcial". A nota honesta era 7 de 10.
- 02/11/2026: a versão dizia "7 de 12" no título, mas a tabela tinha 8 "Atende".
