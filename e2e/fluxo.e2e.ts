/* Fluxo principal no navegador, com duas contas, contra os emuladores do Firebase; axe em cada tela e teste de teclado.
   O app não tem tema escuro próprio (não há prefers-color-scheme no CSS): o axe roda no tema claro, em desktop e em celular. */
import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/* Login Google pelo popup do emulador de Auth: cria a conta fictícia e volta logado */
async function entrarComGoogle(page: Page, abrir: () => Promise<void>, nome: string, email: string) {
  const popupPromise = page.waitForEvent("popup");
  await abrir();
  const popup = await popupPromise;
  /* O popup do emulador liga os botões só depois de carregar os scripts: repete o clique até o formulário aparecer */
  await popup.waitForLoadState("load");
  await expect(async () => {
    await popup.locator("#add-account-button button").click();
    await expect(popup.locator("#email-input")).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  await popup.locator("#email-input").fill(email);
  await popup.locator("#display-name-input").fill(nome);
  await popup.locator("#sign-in").click();
  await popup.waitForEvent("close");
}

/* axe sem violações na tela atual (ou só no seletor indicado) */
async function semViolacoes(page: Page, tela: string, seletor?: string) {
  const builder = new AxeBuilder({ page });
  if (seletor) builder.include(seletor);
  const { violations } = await builder.analyze();
  expect(violations.map((v) => `${tela}: ${v.id} em ${v.nodes.map((n) => n.target.join(" ")).join(", ")} | ${v.nodes[0]?.failureSummary ?? ""}`)).toEqual([]);
}

/* Sem rolagem horizontal na largura atual */
async function semRolagemHorizontal(page: Page) {
  const largura = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(largura).toBeLessThanOrEqual(0);
}

test("dono cria a sala, participante pergunta e curte, dono destaca, responde e encerra", async ({ browser, page, baseURL }, info) => {
  const sufixo = `${info.project.name}-${Date.now()}`;

  /* Dono: Home → login → nova sala → painel */
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Crie sua sala com o Google" })).toBeVisible();
  await semViolacoes(page, "home");
  await semRolagemHorizontal(page);

  await entrarComGoogle(page, () => page.getByRole("button", { name: "Crie sua sala com o Google" }).click(), "Ana Teste", `ana-${sufixo}@empresa.test`);
  await expect(page).toHaveURL(/\/rooms\/new$/);
  await expect(page.getByRole("heading", { name: "Criar uma nova sala" })).toBeVisible();
  await semViolacoes(page, "nova sala");

  await page.getByLabel("Nome da sala").fill(`Aula ${sufixo}`);
  await page.getByRole("button", { name: "Criar sala" }).click();
  await expect(page).toHaveURL(/\/admin\/rooms\/[\w-]+$/);
  const codigo = page.url().split("/").pop()!;
  await expect(page.getByRole("heading", { name: `Sala Aula ${sufixo}` })).toBeVisible();
  await expect(page.getByText("Nenhuma pergunta ainda")).toBeVisible();
  await semViolacoes(page, "painel vazio");

  /* Participante, em outro contexto (outra pessoa): entra pelo código e faz login na sala */
  const u = info.project.use;
  const outro = await browser.newContext({
    baseURL,
    viewport: page.viewportSize(),
    userAgent: u.userAgent,
    isMobile: u.isMobile,
    hasTouch: u.hasTouch,
    deviceScaleFactor: u.deviceScaleFactor,
    reducedMotion: "reduce",
  });
  const participante = await outro.newPage();
  await participante.goto("/");
  await participante.getByLabel("Código da sala").fill(codigo);
  await participante.getByRole("button", { name: "Entrar na sala" }).click();
  await expect(participante).toHaveURL(new RegExp(`/rooms/${codigo}$`));
  await expect(participante.getByText("Nenhuma pergunta por aqui…")).toBeVisible();
  await semViolacoes(participante, "sala sem login");

  await entrarComGoogle(participante, () => participante.getByRole("button", { name: "faça seu login" }).click(), "Bia Teste", `bia-${sufixo}@empresa.test`);
  await expect(participante.getByText("Bia Teste")).toBeVisible();

  const pergunta = `Como funciona o tempo real? ${sufixo}`;
  await participante.getByLabel("Sua pergunta").fill(pergunta);
  await participante.getByRole("button", { name: "Enviar pergunta" }).click();
  await expect(participante.getByText("Pergunta enviada.")).toBeVisible();
  await expect(participante.getByText(pergunta)).toBeVisible();

  const curtir = participante.getByRole("button", { name: /Curtir pergunta/ });
  await curtir.click();
  await expect(curtir).toHaveAttribute("aria-pressed", "true");
  await expect(curtir).toHaveAccessibleName("Curtir pergunta, 1 curtida");
  await semViolacoes(participante, "sala com pergunta");
  await semRolagemHorizontal(participante);

  /* Dono vê a pergunta chegar em tempo real e modera */
  await expect(page.getByText(pergunta)).toBeVisible();
  await expect(page.getByText("1 pergunta", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Destacar pergunta" }).click();
  await expect(page.getByRole("button", { name: "Remover destaque" })).toHaveAttribute("aria-pressed", "true");
  await expect(participante.getByText("Pergunta em destaque.")).toBeAttached();
  await semViolacoes(page, "painel com pergunta");

  await page.getByRole("button", { name: "Marcar pergunta como respondida" }).click();
  await expect(participante.getByText("Pergunta respondida.")).toBeAttached();
  await expect(participante.getByRole("button", { name: /Curtir pergunta/ })).toHaveCount(0);

  /* Quem não é dono não administra a sala */
  await participante.goto(`/admin/rooms/${codigo}`);
  await expect(participante.getByText("Somente quem criou a sala pode administrá-la.")).toBeVisible();

  /* Encerrar: diálogo com foco no Cancelar, Tab preso, Esc cancela; depois confirma */
  const encerrar = page.getByRole("button", { name: "Encerrar sala" });
  await encerrar.click();
  const dialogo = page.getByRole("alertdialog", { name: "Encerrar sala" });
  await expect(dialogo).toBeVisible();
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await semViolacoes(page, "diálogo de encerrar", ".dialog");
  await page.keyboard.press("Tab");
  await expect(dialogo.getByRole("button", { name: "Sim, encerrar" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(dialogo.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialogo).toBeHidden();
  await expect(encerrar).toBeFocused();

  await encerrar.click();
  await dialogo.getByRole("button", { name: "Sim, encerrar" }).click();
  await expect(page).toHaveURL(/\/$/);

  /* Participante vê a sala encerrada, e o código não abre mais a sala */
  await participante.goto(`/rooms/${codigo}`);
  await expect(participante.getByText("Esta sala foi encerrada. Não é possível enviar novas perguntas.")).toBeVisible();
  await participante.goto("/");
  await participante.getByLabel("Código da sala").fill(codigo);
  await participante.getByRole("button", { name: "Entrar na sala" }).click();
  await expect(participante.getByRole("alert")).toHaveText("Esta sala já foi encerrada.");

  await outro.close();
});

test("só teclado: Tab chega aos controles da Home com foco visível e o código vazio mostra aviso", async ({ page }, info) => {
  test.skip(info.project.name === "celular", "teclado só no desktop");
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Crie sua sala com o Google" })).toBeVisible();

  await page.keyboard.press("Tab");
  const criar = page.getByRole("button", { name: "Crie sua sala com o Google" });
  await expect(criar).toBeFocused();
  /* Foco visível com o contorno definido pelo app (global.scss), não o padrão do navegador */
  const contorno = await criar.evaluate((el) => {
    const s = getComputedStyle(el);
    return `${s.outlineStyle} ${s.outlineWidth} ${s.outlineColor}`;
  });
  expect(contorno).toBe("solid 3px rgb(41, 41, 46)");

  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Código da sala")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Entrar na sala" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveText("Digite o código da sala.");

  await page.keyboard.press("Shift+Tab");
  await expect(page.getByLabel("Código da sala")).toBeFocused();
  await page.keyboard.type("sala-que-nao-existe");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toHaveText("Sala não encontrada.");
});
