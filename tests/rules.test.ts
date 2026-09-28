/* Testes das regras do Realtime Database (database.rules.json) no emulador: rode com `npm run test:rules` */
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, it } from "vitest";
import { assertFails, assertSucceeds, initializeTestEnvironment, RulesTestEnvironment } from "@firebase/rules-unit-testing";

let env: RulesTestEnvironment;
const room = { title: "Live", authorId: "dono", createdAt: 1 };
const question = (authorId: string) => ({ content: "Pergunta?", author: { name: "A", avatar: "" }, authorId, isAnswered: false, isHighlighted: false });

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: "letmeask-rules",
    database: { rules: readFileSync("database.rules.json", "utf8"), host: "127.0.0.1", port: 9000 },
  });
});

beforeEach(async () => {
  await env.clearDatabase();
  await env.withSecurityRulesDisabled(async (ctx) => {
    await ctx.database().ref("rooms/r1").set({ ...room, questions: { q1: question("ana") } });
  });
});

afterAll(async () => env.cleanup());

describe("salas", () => {
  it("visitante lê a sala, mas não lista todas as salas", async () => {
    const db = env.unauthenticatedContext().database();
    await assertSucceeds(db.ref("rooms/r1").get());
    await assertFails(db.ref("rooms").get());
  });

  it("só cria sala com authorId igual ao próprio uid", async () => {
    const db = env.authenticatedContext("bia").database();
    await assertSucceeds(db.ref("rooms/r2").set({ title: "Minha", authorId: "bia" }));
    await assertFails(db.ref("rooms/r3").set({ title: "Falsa", authorId: "outra" }));
  });

  it("outro usuário não renomeia, não encerra e não apaga a sala (antes a regra em cascata permitia)", async () => {
    const db = env.authenticatedContext("intruso").database();
    await assertFails(db.ref("rooms/r1/title").set("Hackeada"));
    await assertFails(db.ref("rooms/r1/endedAt").set(2));
    await assertFails(db.ref("rooms/r1").remove());
  });

  it("dono encerra a sala e o authorId não pode ser trocado", async () => {
    const db = env.authenticatedContext("dono").database();
    await assertSucceeds(db.ref("rooms/r1/endedAt").set(2));
    await assertFails(db.ref("rooms/r1/authorId").set("outro"));
  });
});

describe("perguntas e curtidas", () => {
  it("participante logado pergunta em nome próprio; visitante não pergunta", async () => {
    await assertSucceeds(env.authenticatedContext("bia").database().ref("rooms/r1/questions/q2").set(question("bia")));
    await assertFails(env.authenticatedContext("bia").database().ref("rooms/r1/questions/q3").set(question("ana")));
    await assertFails(env.unauthenticatedContext().database().ref("rooms/r1/questions/q4").set(question("x")));
  });

  it("participante não marca como respondida nem apaga pergunta; o dono pode", async () => {
    await assertFails(env.authenticatedContext("ana").database().ref("rooms/r1/questions/q1/isAnswered").set(true));
    await assertFails(env.authenticatedContext("ana").database().ref("rooms/r1/questions/q1").remove());
    await assertSucceeds(env.authenticatedContext("dono").database().ref("rooms/r1/questions/q1/isHighlighted").set(true));
    await assertSucceeds(env.authenticatedContext("dono").database().ref("rooms/r1/questions/q1").remove());
  });

  it("sala encerrada não recebe novas perguntas", async () => {
    await env.withSecurityRulesDisabled(async (ctx) => ctx.database().ref("rooms/r1/endedAt").set(2));
    await assertFails(env.authenticatedContext("bia").database().ref("rooms/r1/questions/q5").set(question("bia")));
  });

  it("curtida só em nome próprio e só o autor a remove", async () => {
    const bia = env.authenticatedContext("bia").database();
    await assertSucceeds(bia.ref("rooms/r1/questions/q1/likes/l1").set({ authorId: "bia" }));
    await assertFails(bia.ref("rooms/r1/questions/q1/likes/l2").set({ authorId: "ana" }));
    await assertFails(env.authenticatedContext("ana").database().ref("rooms/r1/questions/q1/likes/l1").remove());
    await assertSucceeds(bia.ref("rooms/r1/questions/q1/likes/l1").remove());
  });

  it("conteúdo vazio ou acima de 1000 caracteres é recusado", async () => {
    const db = env.authenticatedContext("bia").database();
    await assertFails(db.ref("rooms/r1/questions/q6").set({ ...question("bia"), content: "" }));
    await assertFails(db.ref("rooms/r1/questions/q7").set({ ...question("bia"), content: "x".repeat(1001) }));
  });
});
/* Fim de rules.test.ts */
