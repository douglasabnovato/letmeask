/* Painel do dono da sala: destacar, marcar como respondida, excluir perguntas e encerrar a sala */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import logoImg from "../assets/images/logo.svg";
import deleteImg from "../assets/images/delete.svg";
import checkImg from "../assets/images/check.svg";
import answerImg from "../assets/images/answer.svg";
import emptyImg from "../assets/images/empty-questions.svg";

import { Button } from "../components/Button";
import { Question } from "../components/Question";
import { RoomCode } from "../components/RoomCode";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";
import { database, firebase } from "../services/firebase";
import { questionCountLabel } from "../domain/questions";
import { NotFound } from "./NotFound";

import "../styles/room.scss";

type Pending = { kind: "end" } | { kind: "delete"; questionId: string } | null;

export function AdminRoom() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();
  const { id: roomId } = useParams();
  const { title, questions, loading, notFound, authorId, endedAt } = useRoom(roomId);
  const [pending, setPending] = useState<Pending>(null);
  const [error, setError] = useState("");

  /* Executa uma escrita e mostra erro amigável se as regras recusarem */
  async function run(action: () => Promise<unknown>) {
    setError("");
    try {
      await action();
    } catch {
      setError("Operação não permitida ou sem conexão.");
    }
  }

  /* Confirma a ação pendente do diálogo */
  async function confirmPending() {
    const current = pending;
    setPending(null);
    if (current?.kind === "end") {
      await run(() => database.ref(`rooms/${roomId}`).update({ endedAt: firebase.database.ServerValue.TIMESTAMP }));
      navigate("/");
    } else if (current?.kind === "delete") {
      await run(() => database.ref(`rooms/${roomId}/questions/${current.questionId}`).remove());
    }
  }

  if (notFound) return <NotFound message="Sala não encontrada." />;
  if (!loading && ready && authorId && user?.id !== authorId) {
    return <NotFound message="Somente quem criou a sala pode administrá-la." />;
  }

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <div>
            <RoomCode code={roomId} />
            {!endedAt && <Button isOutlined onClick={() => setPending({ kind: "end" })}>Encerrar sala</Button>}
          </div>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questionCountLabel(questions.length)}</span>}
        </div>
        {endedAt && <p className="room-ended" role="status">Sala encerrada.</p>}
        {error && <p className="form-status error" role="alert">{error}</p>}
        {!loading && questions.length === 0 && (
          <div className="empty-questions">
            <img src={emptyImg} alt="" />
            <h2>Nenhuma pergunta ainda</h2>
            <p>Envie o código da sala para o público começar a perguntar.</p>
          </div>
        )}

        <div className="question-list">
          {questions.map((q) => (
            <Question key={q.id} content={q.content} author={q.author} isAnswered={q.isAnswered} isHighlighted={q.isHighlighted}>
              {!q.isAnswered && (
                <>
                  <button type="button" aria-label="Marcar pergunta como respondida" onClick={() => run(() => database.ref(`rooms/${roomId}/questions/${q.id}`).update({ isAnswered: true }))}>
                    <img src={checkImg} alt="" />
                  </button>
                  <button type="button" aria-label={q.isHighlighted ? "Remover destaque" : "Destacar pergunta"} aria-pressed={q.isHighlighted} onClick={() => run(() => database.ref(`rooms/${roomId}/questions/${q.id}`).update({ isHighlighted: !q.isHighlighted }))}>
                    <img src={answerImg} alt="" />
                  </button>
                </>
              )}
              <button type="button" aria-label="Excluir pergunta" onClick={() => setPending({ kind: "delete", questionId: q.id })}>
                <img src={deleteImg} alt="" />
              </button>
            </Question>
          ))}
        </div>
      </main>

      {pending && (
        <ConfirmDialog
          title={pending.kind === "end" ? "Encerrar sala" : "Excluir pergunta"}
          description={pending.kind === "end" ? "Ninguém mais poderá enviar perguntas. Deseja encerrar?" : "A pergunta será removida para todos. Deseja excluir?"}
          confirmLabel={pending.kind === "end" ? "Sim, encerrar" : "Sim, excluir"}
          onConfirm={confirmPending}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  );
}
/* Fim de AdminRoom.tsx */
