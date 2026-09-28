/* Cartão de pergunta com autor e área de ações */
import { ReactNode } from "react";
import cx from "classnames";
import "./styles.scss";

type QuestionProps = {
  content: string;
  author: { name: string; avatar: string };
  children?: ReactNode;
  isAnswered?: boolean;
  isHighlighted?: boolean;
};

export function Question({ content, author, isAnswered = false, isHighlighted = false, children }: QuestionProps) {
  return (
    <article className={cx("question", { answered: isAnswered }, { highlighted: isHighlighted && !isAnswered })}>
      {isAnswered && <span className="sr-only">Pergunta respondida. </span>}
      {isHighlighted && !isAnswered && <span className="sr-only">Pergunta em destaque. </span>}
      <p>{content}</p>
      <footer>
        <div className="user-info">
          <img src={author.avatar} alt="" referrerPolicy="no-referrer" />
          <span>{author.name}</span>
        </div>
        <div>{children}</div>
      </footer>
    </article>
  );
}
/* Fim de Question/index.tsx */
