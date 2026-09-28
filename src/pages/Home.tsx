/* Página inicial: criar sala com Google ou entrar numa sala pelo código */
import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import illustrationImg from "../assets/images/illustration.svg";
import logoImg from "../assets/images/logo.svg";
import googleIconImg from "../assets/images/google-icon.svg";

import { database } from "../services/firebase";
import { Button } from "../components/Button";
import { useAuth } from "../hooks/useAuth";

import "../styles/auth.scss";

export function Home() {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  /* Faz login (se preciso) e segue para criar sala */
  async function handleCreateRoom() {
    setError("");
    try {
      if (!user) await signInWithGoogle();
      navigate("/rooms/new");
    } catch {
      setError("Não foi possível entrar com o Google. Tente novamente.");
    }
  }

  /* Valida o código e abre a sala */
  async function handleJoinRoom(event: FormEvent) {
    event.preventDefault();
    const code = roomCode.trim().replace(/^#/, "");
    if (!code) {
      setError("Digite o código da sala.");
      return;
    }
    if (!/^[\w-]{3,40}$/.test(code)) {
      setError("Código inválido. Confira e tente de novo.");
      return;
    }
    try {
      const room = await database.ref(`rooms/${code}`).get();
      if (!room.exists()) {
        setError("Sala não encontrada.");
        return;
      }
      if (room.val().endedAt) {
        setError("Esta sala já foi encerrada.");
        return;
      }
      navigate(`/rooms/${code}`);
    } catch {
      setError("Sem conexão. Tente novamente.");
    }
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={illustrationImg} alt="" />
        <strong>Crie salas de Q&amp;A ao vivo</strong>
        <p>Tire as dúvidas da sua audiência em tempo real</p>
      </aside>
      <main>
        <div className="main-content">
          <h1 className="logo"><img src={logoImg} alt="Letmeask" /></h1>
          <button type="button" onClick={handleCreateRoom} className="create-room">
            <img src={googleIconImg} alt="" />
            Crie sua sala com o Google
          </button>
          <div className="separator">ou entre em uma sala</div>
          <form onSubmit={handleJoinRoom} noValidate>
            <label htmlFor="room-code" className="sr-only">Código da sala</label>
            <input id="room-code" type="text" placeholder="Digite o código da sala" onChange={(e) => setRoomCode(e.target.value)} value={roomCode} aria-describedby="home-error" />
            <Button type="submit">Entrar na sala</Button>
          </form>
          <p id="home-error" className="form-error" role="alert">{error}</p>
        </div>
      </main>
    </div>
  );
}
/* Fim de Home.tsx */
