/* Testes do modo emulador: só liga com a variável e com projeto demo-*, para nunca apontar um projeto real ao emulador */
import { describe, it, expect, vi } from "vitest";
import { connectEmulators } from "../services/firebase";

function targets() {
  return { auth: { useEmulator: vi.fn() }, database: { useEmulator: vi.fn() } };
}

describe("connectEmulators", () => {
  it("sem a variável, não liga nada (build publicado)", () => {
    const t = targets();
    expect(connectEmulators(t, undefined, "letmeask-aulas")).toBe(false);
    expect(t.auth.useEmulator).not.toHaveBeenCalled();
    expect(t.database.useEmulator).not.toHaveBeenCalled();
  });

  it("com a variável e projeto demo-*, liga Auth em 9099 e banco em 9000", () => {
    const t = targets();
    expect(connectEmulators(t, "true", "demo-letmeask")).toBe(true);
    expect(t.auth.useEmulator).toHaveBeenCalledWith("http://127.0.0.1:9099");
    expect(t.database.useEmulator).toHaveBeenCalledWith("127.0.0.1", 9000);
  });

  it("recusa ligar o emulador com um projeto real", () => {
    const t = targets();
    expect(() => connectEmulators(t, "true", "letmeask-aulas")).toThrow(/demo-/);
    expect(t.auth.useEmulator).not.toHaveBeenCalled();
  });
});
