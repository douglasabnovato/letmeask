/* Diálogo de confirmação acessível (substitui window.confirm): foco no botão seguro, Esc cancela e o Tab fica preso no diálogo (WAI-ARIA APG) */
import { useEffect, useRef } from "react";
import { Button } from "./Button";

type Props = { title: string; description: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void };

export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const cancelRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key !== "Tab" || !dialogRef.current) return;
      /* Mantém o foco entre o primeiro e o último botão do diálogo */
      const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>("button:not([disabled])"));
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const inside = active ? dialogRef.current.contains(active) : false;
      if (e.shiftKey && (active === first || !inside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !inside)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      opener?.focus();
    };
  }, [onCancel]);

  return (
    <div className="dialog-overlay">
      <div ref={dialogRef} role="alertdialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-desc" className="dialog">
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
