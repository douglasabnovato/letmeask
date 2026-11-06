# MVP — letmeask

> Revisto em 06/11/2026 (ciclo de 03/11/2026). Nível: **Estudo (N1)**. Os critérios 5 e 7 não se aplicam ao N1 e saem da conta. Testado no Windows, com Node 24, no clone da `feature/2026-11-06`. Não houve teste com pessoas nem em aparelho real.

**Finalizado: sim**, pela decisão 4 do processo: os dois critérios que faltam dependem do responsável e têm issue aberta com `depende-do-responsavel`: o 3 (Firebase real, #14, destravado pela #12) e o 10 (proteção da `main`, #13).

> Correção: a versão de 02/11 dizia "7 de 12" no título, mas a tabela tinha 8 "Atende".

## 1. Critérios: 8 de 10 aplicáveis atendidos

| # | Critério | Como verificar | Situação | Evidência e data |
|---|---|---|---|---|
| 1 | Problema e público claros | Dá para explicar em uma frase | Atende: quem apresenta recebe perguntas da audiência ao vivo. | README, 06/11/2026 |
| 2 | Hipótese a validar | Existe uma aposta escrita, com meta | Atende: proposta na seção 2; sem validação com pessoas. | Seção 2 |
| 3 | Fluxo principal completo | Uma pessoa conclui sem ajuda | Parcial: no navegador, só a tela inicial e a validação do código. O login Google exige um projeto Firebase real. O fluxo é coberto por testes com Firebase simulado e as regras, no emulador. | #14 (responsável) |
| 4 | Escopo enxuto | O que não entra está registrado | Atende: seção 3. | 06/11/2026 |
| 5 | Medição de uso | A métrica principal é coletada | Não se aplica (N1). | Decisão 2 do processo |
| 6 | Falhas tratadas | Erro, vazio e carregamento têm resposta clara | Atende: código vazio ou inválido, sala inexistente ou encerrada, sem conexão ao entrar, login Google cancelado e pergunta que não chega ao banco mostram aviso. O texto da pergunta é mantido. | `src/__tests__/app.test.tsx` (9 testes), 06/11/2026 |
| 7 | Desempenho aceitável | LCP de até 2,5 s no celular | Não se aplica (N1). O endereço publicado responde, mas com uma build antiga. | #12 |
| 8 | Acessibilidade básica | axe e teclado | Atende: axe sem violações em 2 telas; foco visível em todas as tabulações; sem rolagem em 375 px. | Ciclo de 02/11/2026 |
| 9 | Segurança e conformidade | Riscos decididos | Atende: `npm audit --omit=dev` sem alertas, com `@grpc/grpc-js` fixado por `overrides`; regras do banco testadas no emulador a cada PR (job `regras`). | CI do #11, 06/11/2026 |
| 10 | Entrega confiável | CI verde antes de entrar na principal | Parcial: CI roda em PR e push para `main` e `developer/**`, mas a `main` não tem proteção. | #13 (responsável) |
| 11 | Testes dos fluxos críticos | Testes automatizados no CI | Atende: 9 testes de interface e 9 de regras do banco. | CI do #11 |
| 12 | Documentação honesta | O README ensina a rodar | Atende: comandos conferidos com o `package.json`; README corrigido onde dizia que o CI publica no Pages; seção de estado e próximos passos. | README, 06/11/2026 |

## 2. Hipótese (proposta)

Praticar React com Firebase: criar sala e receber uma pergunta sem ajuda.

## 3. Fora do MVP

Moderação avançada e histórico entre eventos.

## 4. Neste ciclo

CI nos PRs para `developer/**` e testes de regras no CI; testes de falhas do Firebase; arquivos do Create React App, imagens duplicadas, `yarn.lock` e cache `.firebase` removidos; documentação e 6 issues (#12 a #17).
