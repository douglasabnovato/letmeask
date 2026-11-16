/* Testes do diálogo de confirmação: foco inicial no Cancelar, Tab e Shift+Tab presos no diálogo, Esc cancela e devolve o foco */
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { ConfirmDialog } from "../components/ConfirmDialog";

afterEach(() => cleanup());

function Harness({ onConfirm = () => undefined }: { onConfirm?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>Encerrar sala</button>
      <a href="#fora">Link fora do diálogo</a>
      {open && <ConfirmDialog title="Encerrar sala" description="Deseja encerrar?" confirmLabel="Sim, encerrar" onConfirm={onConfirm} onCancel={() => setOpen(false)} />}
    </>
  );
}

describe("ConfirmDialog", () => {
  it("abre com foco no Cancelar e o Tab não sai do diálogo", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Encerrar sala" }));
    const cancel = screen.getByRole("button", { name: "Cancelar" });
    const confirm = screen.getByRole("button", { name: "Sim, encerrar" });
    expect(document.activeElement).toBe(cancel);
    await user.tab();
    expect(document.activeElement).toBe(confirm);
    await user.tab();
    expect(document.activeElement).toBe(cancel);
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(confirm);
  });

  it("Esc fecha e devolve o foco ao botão que abriu", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Encerrar sala" });
    await user.click(opener);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("alertdialog")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("confirmar chama a ação", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<Harness onConfirm={onConfirm} />);
    await user.click(screen.getByRole("button", { name: "Encerrar sala" }));
    await user.click(screen.getByRole("button", { name: "Sim, encerrar" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
