/* Página 404 da aplicação */
import { Link } from "react-router-dom";
import logoImg from "../assets/images/logo.svg";
import "../styles/room.scss";

export function NotFound({ message = "Página não encontrada." }: { message?: string }) {
  return (
    <main className="not-found">
      <img src={logoImg} alt="Letmeask" />
      <h1>{message}</h1>
      <Link to="/">Voltar ao início</Link>
    </main>
  );
}
/* Fim de NotFound.tsx */
