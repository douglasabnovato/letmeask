/* Botão que copia o código da sala e confirma a cópia para leitores de tela */
import { useState } from "react";
import copyImg from "../assets/images/copy.svg";
import "../styles/room-code.scss";

export function RoomCode({ code }: { code: string | undefined }) {
  const [copied, setCopied] = useState(false);

  /* Copia o código para a área de transferência */
  async function copyRoomCodeToClipboard() {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button type="button" className="room-code" onClick={copyRoomCodeToClipboard} aria-label={`Copiar código da sala ${code}`}>
      <div><img src={copyImg} alt="" /></div>
      <span aria-live="polite">{copied ? "Código copiado!" : `Sala #${code}`}</span>
    </button>
  );
}
/* Fim de RoomCode.tsx */
