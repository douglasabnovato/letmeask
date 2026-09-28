/* Build com Vite (substitui react-scripts 4 e node-sass) e testes com Vitest */
/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: { outDir: "build" },
  test: { environment: "jsdom", include: ["src/**/*.test.{ts,tsx}"] },
});
/* Fim de vite.config.ts */
