import { expect, test } from "@playwright/test";

test.describe("Catálogo de NFTs", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("deve carregar a aplicação corretamente", async ({ page }) => {
    await expect
    .poll(() => new URL(page.url()).pathname)
    .toBe("/");

    await expect(page.locator("#root")).toBeVisible();
  });

  test("deve carregar os NFTs da API simulada", async ({ page }) => {
    // Aguarda o MSW estar ativo no navegador.
    await page.waitForFunction(() => {
      return Boolean(navigator.serviceWorker?.controller);
    });

    const result = await page.evaluate(async () => {
      const response = await fetch("/api/nfts");

      const contentType = response.headers.get("content-type");

      if (!response.ok || !contentType?.includes("application/json")) {
        throw new Error(
          `Resposta inesperada: HTTP ${response.status}, Content-Type: ${contentType}`,
        );
      }

      return response.json();
    });

    expect(result).toBeDefined();
  });
});