/* Sala do público: enviar pergunta (logado) e curtir perguntas em tempo real */
import { FormEvent, useState } from "react";
import { useParams } from "react-router-dom";

import logoImg from "../assets/images/logo.svg";
import emptyImg from "../assets/images/empty-questions.svg";

import { Button } from "../components/Button";
import { Question } from "../components/Question";
import { RoomCode } from "../components/RoomCode";
import { useAuth } from "../hooks/useAuth";
import { useRoom } from "../hooks/useRoom";
import { database, firebase } from "../services/firebase";
import { MAX_QUESTION_LENGTH, questionCountLabel } from "../domain/questions";
import { NotFound } from "./NotFound";

import "../styles/room.scss";

export function Room() {
  const { user, signInWithGoogle } = useAuth();
  const { id: roomId } = useParams();
  const [newQuestion, setNewQuestion] = useState("");
  const [status, setStatus] = useState({ kind: "", text: "" });
  const { title, questions, loading, notFound, endedAt } = useRoom(roomId);

  /* Envia a pergunta com o autor e a data do servidor */
  async function handleSendQuestion(event: FormEvent) {
    event.preventDefault();
    const content = newQuestion.trim();
    if (!content || !user) return;
    try {
      await database.ref(`rooms/${roomId}/questions`).push({
        content,
        author: { name: user.name, avatar: user.avatar },
        authorId: user.id,
        isHighlighted: false,
        isAnswered: false,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
      setNewQuestion("");
      setStatus({ kind: "ok", text: "Pergunta enviada." });
    } catch {
      setStatus({ kind: "error", text: "Não foi possível enviar. Tente novamente." });
    }
  }

  /* Curte ou remove a curtida do usuário */
  async function handleLikeQuestion(questionId: string, likeId: string | undefined) {
    if (!user) return;
    const likes = database.ref(`rooms/${roomId}/questions/${questionId}/likes`);
    try {
      if (likeId) await likes.child(likeId).remove();
      else await likes.push({ authorId: user.id });
    } catch {
      setStatus({ kind: "error", text: "Não foi possível registrar a curtida." });
    }
  }

  if (notFound) return <NotFound message="Sala não encontrada." />;

  return (
    <div id="page-room">
      <header>
        <div className="content">
          <img src={logoImg} alt="Letmeask" />
          <RoomCode code={roomId} />
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala {title}</h1>
          {questions.length > 0 && <span>{questionCountLabel(questions.length)}</span>}
        </div>

        {endedAt ? (
          <p className="room-ended" role="status">Esta sala foi encerrada. Não é possível enviar novas perguntas.</p>
        ) : (
          <form onSubmit={handleSendQuestion}>
            <label htmlFor="new-question" className="sr-only">Sua pergunta</label>
            <textarea id="new-question" maxLength={MAX_QUESTION_LENGTH} placeholder="O que você quer perguntar?" onChange={(e) => setNewQuestion(e.target.value)} value={newQuestion} />
            <div className="form-footer">
              {user ? (
                <div className="user-info">
                  <img src={user.avatar} alt="" referrerPolicy="no-referrer" />
                  <span>{user.name}</span>
                </div>
              ) : (
                <span>Para enviar uma pergunta, <button type="button" className="link-button" onClick={() => signInWithGoogle().catch(() => setStatus({ kind: "error", text: "Login cancelado." }))}>faça seu login</button>.</span>
              )}
              <Button type="submit" disabled={!user || !newQuestion.trim()}>Enviar pergunta</Button>
            </div>
            <p className={`form-status ${status.kind}`} role={status.kind === "error" ? "alert" : "status"}>{status.text}</p>
          </form>
        )}

        {loading && <p role="status">Carregando perguntas…</p>}
        {!loading && questions.length === 0 && (
          <div className="empty-questions">
            <img src={emptyImg} alt="" />
            <h2>Nenhuma pergunta por aqui…</h2>
            <p>Seja a primeira pessoa a perguntar!</p>
          </div>
        )}

        <div className="question-list">
          {questions.map((question) => (
            <Question key={question.id} content={question.content} author={question.author} isAnswered={question.isAnswered} isHighlighted={question.isHighlighted}>
              {!question.isAnswered && (
                <button
                  className={`like-button ${question.likeId ? "liked" : ""}`}
                  type="button"
                  aria-label={`Curtir pergunta (${question.likeCount} curtida${question.likeCount === 1 ? "" : "s"})`}
                  aria-pressed={Boolean(question.likeId)}
                  disabled={!user}
                  onClick={() => handleLikeQuestion(question.id, question.likeId)}
                >
                  {question.likeCount > 0 && <span aria-hidden="true">{question.likeCount}</span>}
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 22H4C3.46957 22 2.96086 21.7893 2.58579 21.4142C2.21071 21.0391 2 20.5304 2 20V13C2 12.4696 2.21071 11.9609 2.58579 11.5858C2.96086 11.2107 3.46957 11 4 11H7M14 9V5C14 4.20435 13.6839 3.44129 13.1213 2.87868C12.5587 2.31607 11.7956 2 11 2L7 11V22H18.28C18.7623 22.0055 19.2304 21.8364 19.5979 21.524C19.9654 21.2116 20.2077 20.7769 20.28 20.3L21.66 11.3C21.7035 11.0134 21.6842 10.7207 21.6033 10.4423C21.5225 10.1638 21.3821 9.90629 21.1919 9.68751C21.0016 9.46873 20.7661 9.29393 20.5016 9.17522C20.2371 9.0565 19.9499 8.99672 19.66 9H14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </Question>
          ))}
        </div>
      </main>
    </div>
  );
}
/* Fim de Room.tsx */
