/* Assina a sala no Realtime Database e expõe título, perguntas ordenadas, autor e estado */
import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";
import { FirebaseQuestion, parseQuestions, QuestionType, sortQuestions } from "../domain/questions";

type RoomState = {
  loading: boolean;
  notFound: boolean;
  title: string;
  authorId?: string;
  endedAt?: number | string;
  questions: QuestionType[];
};

export function useRoom(roomId: string | undefined) {
  const { user } = useAuth();
  const [state, setState] = useState<RoomState>({ loading: true, notFound: false, title: "", questions: [] });

  useEffect(() => {
    if (!roomId || !database) return undefined;
    const roomRef = database.ref(`rooms/${roomId}`);
    const listener = roomRef.on("value", (snapshot) => {
      const room = snapshot.val() as { title: string; authorId: string; endedAt?: number; questions?: Record<string, FirebaseQuestion> } | null;
      if (!room) {
        setState({ loading: false, notFound: true, title: "", questions: [] });
        return;
      }
      setState({
        loading: false,
        notFound: false,
        title: room.title,
        authorId: room.authorId,
        endedAt: room.endedAt,
        questions: sortQuestions(parseQuestions(room.questions, user?.id)),
      });
    });
    return () => roomRef.off("value", listener);
  }, [roomId, user?.id]);

  return state;
}
/* Fim de useRoom.ts */
