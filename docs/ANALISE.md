# Análise — Letmeask

## 1. Especificação

Salas de perguntas e respostas ao vivo: quem apresenta cria a sala, o público entra com o código, envia e curte perguntas, e quem apresenta destaca, marca como respondida, remove e encerra.

| Ator | Objetivo |
|---|---|
| Apresentador (dono da sala) | Organizar as perguntas do público durante a live |
| Participante logado | Perguntar e curtir as perguntas mais relevantes |
| Visitante | Acompanhar as perguntas sem login |

### Requisitos funcionais

| ID | Requisito | Critério de aceite | Antes |
|---|---|---|---|
| RF01 | Criar sala | Login Google → título → sala criada com `authorId` e data do servidor | ⚠️ data do navegador |
| RF02 | Entrar com código | Código válido abre a sala; inválido/encerrado mostra aviso na página | ❌ `alert()` em inglês |
| RF03 | Perguntar | Só logado, até 1000 caracteres, sala não encerrada | ⚠️ sem limite |
| RF04 | Curtir / descurtir | Uma curtida por pessoa, contagem ao vivo | ✅ |
| RF05 | Moderar | Só o dono destaca, marca respondida, remove e encerra | ❌ qualquer logado podia |
| RF06 | Copiar código | Botão copia o código para a área de transferência | ❌ não implementado |

## 2. Defeitos encontrados

| # | Severidade | Defeito | Referência |
|---|---|---|---|
| D1 | Crítica | Projeto não compilava: imports `firebase/compat/*` com `firebase@8` instalado; `node-sass` falha no Node 20 | — |
| D2 | Crítica | Regras usavam `auth.id` (não existe; o correto é `auth.uid`) e `rooms/.write` cascateava escrita a qualquer usuário logado: qualquer um podia apagar ou encerrar salas alheias | OWASP A01:2025 |
| D3 | Alta | Rota `/` sem `exact` capturava todas as rotas (sala nunca abria direto pelo link) | — |
| D4 | Alta | Painel `/admin/rooms/:id` acessível por qualquer pessoa | OWASP A01:2025 |
| D5 | Média | Datas geradas com `new Date()` no navegador (manipuláveis e fora de ordem) | — |
| D6 | Média | `alert()` em inglês, sem estado de carregando/sala inexistente | Nielsen #1, #9 |
| D7 | Média | Contraste abaixo de AA (roxo, cinzas e botão Google), curtida sem estado acessível | WCAG 2.2 1.4.3, 4.1.2 |
| D8 | Baixa | Listener do `useRoom` removido com `off('value')` genérico; `images.zip` e SVGs duplicados no repositório | — |

## 3. Baseline automatizado

| Verificação | Antes | Depois |
|---|---|---|
| `npm run build` | ❌ falha | ✅ |
| `tsc --noEmit` | ❌ | ✅ |
| Testes | 0 | 6 (UI) + 9 (regras, emulador) |
| `npm audit` | alertas herdados do CRA 4 | 0 |
| axe-core (`/`, `/rooms/new`, `/rooms/:id`) | não executável | 0 violações |

## Rubrica v2 (grupo fullstack)

Aprovação: média ponderada ≥ 7,0 **e** C1 e C4 (eliminatórios) ≥ 5. Regras: nota sem evidência vale no máximo 6; C1 limitado a 7 para parte não executada de ponta a ponta; C9 ≥ 8 só com URL publicada e CI verde.

| # | Critério | Referência | Peso | Antes | Depois | Evidência | Justificativa |
|---|---|---|---|---|---|---|---|
| C1 | Núcleo de valor | MVP (Ries); SWEBOK Requirements | 16% | 3 | 7 | build OK; telas renderizadas no Chromium | Antes não compilava (imports compat com firebase@8) e a rota "/" capturava todas; agora compila e navega. Máx. 7: sem projeto Firebase real |
| C2 | Estados e condições excepcionais | Nielsen; OWASP A10:2025 | 8% | 2 | 7 | testes de sala inexistente/encerrada; print | Sala inexistente, encerrada, carregando, sem login e 404 |
| C3 | Acessibilidade | WCAG 2.2 AA (axe-core) | 7% | 3 | 8 | axe-core 0 violações em /, /rooms/new, /rooms/:id | Contraste AA, foco visível, aria-pressed nos likes, diálogo acessível no lugar de react-modal/alert |
| C4 | Segurança e privacidade | OWASP Top 10:2025 / ASVS 5.0 N1 | 14% | 2 | 6 | database.rules.json reescrito (não testado em emulador) | Regras usavam `auth.id` (inexistente) e `.write` em rooms cascateava; corrigido, mas sem teste de regras → máx. 6 |
| C5 | Dados | 3FN / ACID / fonte única | 10% | 3 | 6 | regras de validação no schema | Datas com ServerValue.TIMESTAMP; limites de tamanho; sem teste de regras |
| C6 | Testes | Pirâmide de testes; SWEBOK Testing | 9% | 0 | 7 | vitest 6 testes (UI) + 9 testes de regras prontos p/ emulador | Domínio, rotas, estados e permissões na interface testados; suíte de regras escrita mas não executada aqui (download do emulador bloqueado) |
| C7 | Qualidade de código | SOLID / camadas; SWEBOK Construction | 7% | 4 | 8 | tsc limpo; domínio isolado | Hook useRoom com listener correto, componentes tipados |
| C8 | Desempenho | Complexidade; Core Web Vitals | 5% | 5 | 7 | build Vite; bundle compat | Sem medição Lighthouse |
| C9 | Operação | 12-Factor; DORA | 7% | 3 | 7 | scripts build/deploy; CI em ci/ | Firebase Hosting gratuito; sem URL publicada |
| C10 | Documentação | README como contrato | 5% | 4 | 8 | readme + docs/ | Como configurar, rodar, testar e publicar |
| C11 | Produto e evidência | Cagan (4 riscos); Torres | 7% | 4 | 7 | 3 pontas do fluxo host↔público | Resolve o problema do evento ao vivo; falta métrica de uso |
| C12 | Sustentabilidade técnica | OWASP A03:2025; SWEBOK Maintenance | 5% | 2 | 8 | npm audit 0; Vite 8, React 18, Firebase 11 | Saiu do CRA4 + node-sass (quebra no Node 20) |

**Média ponderada:** antes **2,75** (REPROVADO) → depois **7,0** (APROVADO).

## Limitações da avaliação

- Não houve projeto Firebase real nem emulador (download bloqueado neste ambiente): o fluxo completo e as regras não foram executados. Por isso C1 ficou em 7 e C4/C5 em 6.
- A nota sobe para C4 = 8 e C5 = 7 quando `npm run test:rules` passar no seu computador.
