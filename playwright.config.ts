/* Playwright: fluxo principal no navegador contra os emuladores do Firebase (Auth e Realtime Database), projeto demo-letmeask */
import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 5191);

/* Configuração falsa de um projeto demo-*: o SDK só fala com os emuladores locais */
const firebaseEnv = {
  VITE_FIREBASE_EMULATORS: "true",
  VITE_FIREBASE_API_KEY: "demo-api-key",
  VITE_FIREBASE_AUTH_DOMAIN: "demo-letmeask.firebaseapp.com",
  VITE_FIREBASE_DATABASE_URL: "https://demo-letmeask-default-rtdb.firebaseio.com",
  VITE_FIREBASE_PROJECT_ID: "demo-letmeask",
  VITE_FIREBASE_STORAGE_BUCKET: "",
  VITE_FIREBASE_MESSAGING_SENDER_ID: "",
  VITE_FIREBASE_APP_ID: "demo-app",
};

export default defineConfig({
  testDir: "e2e",
  testMatch: "**/*.e2e.ts",
  timeout: 60_000,
  retries: 0,
  workers: 1,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
    reducedMotion: "reduce",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    /* O teste "só teclado" vale para o desktop; no celular ele fica fora pelo grepInvert, sem skip */
    { name: "celular", grepInvert: /só teclado/, use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: `npx vite build --mode e2e --outDir build-e2e && npx vite preview --outDir build-e2e --host 127.0.0.1 --port ${PORT} --strictPort`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: firebaseEnv,
  },
});
/* Fim de playwright.config.ts */
