/* Testes: regras de perguntas, roteamento (bug do "/" sem exact) e fluxo de entrar em sala com Firebase simulado */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { parseQuestions, sortQuestions, questionCountLabel } from "../domain/questions";

const rooms: Record<string, unknown> = {};
const pushed: Array<{ path: string; value: unknown }> = [];
let currentUser: { uid: string; displayName: string; photoURL: string | null } | null = null;

vi.mock("../services/firebase", () => {
  const snapshot = (v: unknown) => ({ val: () => v ?? null, exists: () => v != null });
  const ref = (path: string) => {
    const id = path.split("/")[1];
    return {
      get: async () => snapshot(rooms[id]),
      on: (_e: string, cb: (s: unknown) => void) => { cb(snapshot(rooms[id])); return cb; },
      off: () => undefined,
      push: vi.fn(async (value: unknown) => { pushed.push({ path, value }); return { key: "nova" }; }),
    };
  };
  return {
    isFirebaseConfigured: true,
    auth: { onAuthStateChanged: (cb: (u: unknown) => void) => { cb(currentUser); return () => undefined; }, signInWithPopup: vi.fn(), signOut: vi.fn() },
    database: { ref },
    firebase: { auth: { GoogleAuthProvider: class {} }, database: { ServerValue: { TIMESTAMP: 0 } } },
  };
});

const { default: App } = await import("../App");

beforeEach(() => {
  cleanup();
  for (const k of Object.keys(rooms)) delete rooms[k];
  pushed.length = 0;
  currentUser = null;
  window.history.pushState({}, "", "/");
});

describe("domínio de perguntas", () => {
  it("conta curtidas, identifica a do usuário e ordena destaque > curtidas > respondidas", () => {
    const list = parseQuestions({
      a: { content: "A", author: { name: "x", avatar: "" }, isAnswered: true, isHighlighted: false, likes: { l1: { authorId: "u1" } } },
      b: { content: "B", author: { name: "y", avatar: "" }, isAnswered: false, isHighlighted: false, likes: { l2: { authorId: "u2" }, l3: { authorId: "u1" } } },
      c: { content: "C", author: { name: "z", avatar: "" }, isAnswered: false, isHighlighted: true },
    }, "u1");
    expect(sortQuestions(list).map((q) => q.id)).toEqual(["c", "b", "a"]);
    expect(list.find((q) => q.id === "b")?.likeId).toBe("l3");
    expect(questionCountLabel(1)).toBe("1 pergunta");
  });
});

describe("rotas", () => {
  it("a sala abre em /rooms/:id (antes a Home capturava todas as rotas)", async () => {
    rooms.r1 = { title: "Live React", authorId: "dono", questions: {} };
    window.history.pushState({}, "", "/rooms/r1");
    render(<App />);
    expect(await screen.findByRole("heading", { name: "Sala Live React" })).toBeTruthy();
    expect(screen.getByText(/Seja a primeira pessoa/)).toBeTruthy();
  });

  it("sala inexistente mostra 404 próprio", async () => {
    window.history.pushState({}, "", "/rooms/nao-existe");
    render(<App />);
    expect(await screen.findByText("Sala não encontrada.")).toBeTruthy();
  });

  it("entrar com código de sala encerrada mostra aviso em vez de alert()", async () => {
    rooms.fechada = { title: "Antiga", authorId: "x", endedAt: 1 };
    render(<App />);
    await userEvent.type(screen.getByLabelText("Código da sala"), "fechada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar na sala" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Esta sala já foi encerrada.");
  });
});
describe("permissões na interface", () => {
  it("participante logado envia pergunta com authorId e createdAt do servidor", async () => {
    currentUser = { uid: "u9", displayName: "Ana Souza", photoURL: null };
    rooms.r2 = { title: "Aula", authorId: "dono", questions: {} };
    window.history.pushState({}, "", "/rooms/r2");
    render(<App />);
    await userEvent.type(await screen.findByLabelText("Sua pergunta"), "Como usar hooks?");
    await userEvent.click(screen.getByRole("button", { name: "Enviar pergunta" }));
    expect(pushed[0].path).toBe("rooms/r2/questions");
    expect(pushed[0].value).toMatchObject({ content: "Como usar hooks?", authorId: "u9", isAnswered: false });
  });

  it("quem não é dono da sala não acessa o painel de administração", async () => {
    currentUser = { uid: "intruso", displayName: "X", photoURL: null };
    rooms.r3 = { title: "Privada", authorId: "dono", questions: {} };
    window.history.pushState({}, "", "/admin/rooms/r3");
    render(<App />);
    expect(await screen.findByText(/Somente quem criou/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Encerrar sala/ })).toBeNull();
  });
});
/* Fim de app.test.tsx */
