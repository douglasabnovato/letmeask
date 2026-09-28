/* Rotas da aplicação (React Router 7) com aviso quando o Firebase não está configurado; basename segue o base do Vite (/ no Firebase Hosting, /letmeask/ no GitHub Pages) */
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { NewRoom } from "./pages/NewRoom";
import { Room } from "./pages/Room";
import { AdminRoom } from "./pages/AdminRoom";
import { NotFound } from "./pages/NotFound";
import { AuthContextProvider } from "./contexts/AuthContext";
import { isFirebaseConfigured } from "./services/firebase";

export default function App() {
  if (!isFirebaseConfigured) {
    return (
      <main className="config-error" role="alert">
        <h1>Configuração pendente</h1>
        <p>Crie o arquivo <code>.env</code> a partir de <code>.env.example</code> com as chaves do seu projeto Firebase e reinicie o servidor.</p>
      </main>
    );
  }
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <AuthContextProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/rooms/new" element={<NewRoom />} />
          <Route path="/rooms/:id" element={<Room />} />
          <Route path="/admin/rooms/:id" element={<AdminRoom />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthContextProvider>
    </BrowserRouter>
  );
}
/* Fim de App.tsx */
