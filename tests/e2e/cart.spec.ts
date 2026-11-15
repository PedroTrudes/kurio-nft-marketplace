import { test, expect } from "@playwright/test";

test.describe("Carrinho de compras", () => {
  test("deve adicionar um NFT ao carrinho como visitante", async ({
    page,
  }) => {
    await page.goto("/");

    const nftLink = page.locator('a[href^="/nft/"]').first();

    await expect(nftLink).toBeVisible();

    await nftLink.click();

    await expect(page).toHaveURL(/\/nft\/[^/]+$/);

    const addToCartButton = page.getByRole("button", {
      name: "Adicionar ao carrinho",
    });

    await expect(addToCartButton).toBeVisible();
    await expect(addToCartButton).toBeEnabled();

    await addToCartButton.click();

    await expect(
      page.getByRole("status").filter({
        hasText: "adicionada(s) ao carrinho",
      }),
    ).toBeVisible();

    await page.goto("/cart");

    await expect(
      page.getByText("Seu carrinho está vazio"),
    ).not.toBeVisible();
  });
});