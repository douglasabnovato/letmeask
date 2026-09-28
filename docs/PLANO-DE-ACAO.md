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
