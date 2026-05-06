import { expect, test } from "@playwright/test";

test("opens the mobile menu and navigates", async ({ page }) => {
  await page.goto("/");
  await page.getByPlaceholder("seu@email.com").fill("felipe.mobile@test.com");
  await page.getByPlaceholder(/6 caracteres/i).fill("123456");
  await page.getByRole("button", { name: "Entrar" }).last().click();
  await expect(page.getByText("Spend Wise").first()).toBeVisible();

  await page.getByTitle("Menu").click();
  await page.getByRole("button", { name: /Busca/i }).click();

  await expect(page.getByText("Busca Global")).toBeVisible();
});
