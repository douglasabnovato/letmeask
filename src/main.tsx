/* Ponto de entrada: estilos globais e renderização com React 18 */
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import "./styles/global.scss";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
/* Fim de main.tsx */
