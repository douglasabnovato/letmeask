/* Regras puras das perguntas: normalização dos dados do Realtime Database e ordenação da lista */
export type FirebaseQuestion = {
  author: { name: string; avatar: string };
  authorId?: string;
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  createdAt?: number;
  likes?: Record<string, { authorId: string }>;
};

export type QuestionType = {
  id: string;
  author: { name: string; avatar: string };
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likeCount: number;
  likeId: string | undefined;
  createdAt: number;
};

export const MAX_QUESTION_LENGTH = 1000;
export const MAX_ROOM_TITLE_LENGTH = 100;

/* Converte o mapa do banco em lista, com contagem de curtidas e a curtida do usuário atual */
export function parseQuestions(raw: Record<string, FirebaseQuestion> | undefined | null, userId?: string): QuestionType[] {
  return Object.entries(raw ?? {}).map(([id, q]) => ({
    id,
    content: q.content,
    author: q.author,
    isAnswered: Boolean(q.isAnswered),
    isHighlighted: Boolean(q.isHighlighted),
    createdAt: q.createdAt ?? 0,
    likeCount: Object.keys(q.likes ?? {}).length,
    likeId: Object.entries(q.likes ?? {}).find(([, like]) => like.authorId === userId)?.[0],
  }));
}

/* Ordem de exibição: destacadas, depois não respondidas por curtidas; respondidas no fim */
export function sortQuestions(list: QuestionType[]): QuestionType[] {
  const rank = (q: QuestionType) => (q.isAnswered ? 2 : q.isHighlighted ? 0 : 1);
  return [...list].sort((a, b) => rank(a) - rank(b) || b.likeCount - a.likeCount || a.createdAt - b.createdAt);
}

/* Texto "N pergunta(s)" com singular correto */
export function questionCountLabel(n: number): string {
  return n === 1 ? "1 pergunta" : `${n} perguntas`;
}
/* Fim de questions.ts */
