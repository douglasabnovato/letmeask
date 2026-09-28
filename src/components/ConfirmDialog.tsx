/* Diálogo de confirmação acessível (substitui window.confirm): foco no botão seguro e Esc cancela */
import { useEffect, useRef } from "react";
import { Button } from "./Button";

type Props = { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void };

export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onCancel]);

  return (
    <div className="dialog-overlay">
      <div role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc" className="dialog">
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-desc">{description}</p>
        <div className="dialog-actions">
          <Button ref={cancelRef} isOutlined onClick={onCancel}>Cancelar</Button>
          <Button className="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
/* Fim de ConfirmDialog.tsx */
