/* Criação de sala (exige login); o autor é gravado para as regras do banco */
import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import illustrationImg from "../assets/images/illustration.svg";
import logoImg from "../assets/images/logo.svg";

import { Button } from "../components/Button";
import { database, firebase } from "../services/firebase";
import { useAuth } from "../hooks/useAuth";
import { MAX_ROOM_TITLE_LENGTH } from "../domain/questions";

import "../styles/auth.scss";

export function NewRoom() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const [newRoom, setNewRoom] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !user) navigate("/");
  }, [ready, user, navigate]);

  /* Cria a sala e leva ao painel do administrador */
  async function handleCreateRoom(event: FormEvent) {
    event.preventDefault();
    const title = newRoom.trim();
    if (!title) {
      setError("Dê um nome para a sala.");
      return;
    }
    if (!user) return;
    try {
      const ref = await database.ref("rooms").push({ title, authorId: user.id, createdAt: firebase.database.ServerValue.TIMESTAMP });
      navigate(`/admin/rooms/${ref.key}`);
    } catch {
      setError("Não foi possível criar a sala. Tente novamente.");
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
          <img src={logoImg} alt="Letmeask" />
          <h1 className="page-title">Criar uma nova sala</h1>
          <form onSubmit={handleCreateRoom} noValidate>
            <label htmlFor="room-name" className="sr-only">Nome da sala</label>
            <input id="room-name" type="text" maxLength={MAX_ROOM_TITLE_LENGTH} placeholder="Nome da sala" onChange={(e) => setNewRoom(e.target.value)} value={newRoom} aria-describedby="new-room-error" />
            <Button type="submit">Criar sala</Button>
          </form>
          <p id="new-room-error" className="form-error" role="alert">{error}</p>
          <p>Quer entrar em uma sala existente? <Link to="/">clique aqui</Link></p>
        </div>
      </main>
    </div>
  );
}
/* Fim de NewRoom.tsx */
