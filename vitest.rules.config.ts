/* Configuração dos testes de regras (ambiente Node, exige o emulador do Realtime Database) */
import { defineConfig } from "vitest/config";

export default defineConfig({ test: { include: ["tests/rules.test.ts"], environment: "node", testTimeout: 15000 } });
/* Fim de vitest.rules.config.ts */
