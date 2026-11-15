import { test, expect } from "@playwright/test";

test.describe("Checkout - fluxo completo de compra", () => {
  test("deve permitir que um visitante crie uma conta e finalize uma compra", async ({
    page,
  }) => {
    // Gera dados únicos para evitar conflito entre execuções.
    const uniqueId = crypto.randomUUID().slice(0, 8);

    const username = `usuario${uniqueId}`;
    const email = `teste${uniqueId}@email.com`;
    const password = "Teste@123456";

    // 1. Acessar o catálogo.
    await page.goto("/");

    // 2. Abrir os detalhes do primeiro NFT.
    const nftLink = page.locator('a[href^="/nft/"]').first();

    await expect(nftLink).toBeVisible();
    await nftLink.click();

    await expect(page).toHaveURL(/\/nft\/[^/]+$/);

    // Guarda o nome do NFT para verificar depois.
    const nftName = await page.locator("main h1").innerText();

    // 3. Adicionar o NFT ao carrinho como visitante.
    await page
      .getByRole("button", {
        name: "Adicionar ao carrinho",
      })
      .click();

    await expect(
      page.getByRole("status").filter({
        hasText: "adicionada(s) ao carrinho",
      }),
    ).toBeVisible();

    // 4. Acessar o carrinho.
    await page.goto("/cart");

    await expect(
      page.getByText(nftName, { exact: true }),
    ).toBeVisible();

    // 5. Acessar o checkout diretamente.
    // Como o usuário ainda não está autenticado,
    // a aplicação deve solicitar login ou cadastro.
    await page.goto("/checkout");

    await expect(
      page.getByRole("heading", {
        name: "Entre para finalizar sua compra",
      }),
    ).toBeVisible();

    // 6. Abrir o modal de autenticação.
    await page
      .getByRole("button", {
        name: "Entrar ou criar conta",
      })
      .click();

    const authDialog = page.getByRole("dialog");

    await expect(authDialog).toBeVisible();

    // 7. Alternar para o formulário de cadastro.
    await authDialog
      .getByRole("button", {
        name: "Criar conta",
      })
      .click();

    // 8. Preencher os dados do usuário.
    await authDialog
      .getByRole("textbox", {
        name: "Nome de usuário",
      })
      .fill(username);

    await authDialog
      .getByRole("textbox", {
        name: "E-mail",
      })
      .fill(email);

    await authDialog
      .getByLabel("Senha", { exact: true })
      .fill(password);

    await authDialog
      .getByLabel("Confirmar senha")
      .fill(password);

    // 9. Enviar o cadastro.
    await authDialog
      .getByRole("button", {
        name: "Criar conta",
      })
      .last()
      .click();

    // 10. O modal deve fechar após o cadastro.
    await expect(authDialog).not.toBeVisible();

    // 11. O carrinho do visitante deve continuar disponível.
    await expect(
      page.getByRole("heading", {
        name: "Itens do pedido",
      }),
    ).toBeVisible();

    await expect(
      page.getByText(nftName, { exact: true }),
    ).toBeVisible();

    // 12. Confirmar a compra.
    await page
      .getByRole("button", {
        name: "Confirmar compra",
      })
      .click();

    await expect(page).toHaveURL(/\/order\/[^/]+$/);

    await expect(page.locator("main")).toBeVisible();
  });
});