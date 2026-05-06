import { expect, test } from "@playwright/test";

async function login(page) {
  await page.goto("/");
  await page.getByPlaceholder("seu@email.com").fill("felipe.e2e@test.com");
  await page.getByPlaceholder(/6 caracteres/i).fill("123456");
  await page.getByRole("button", { name: "Entrar" }).last().click();
  await expect(page.getByText("Transações Recentes")).toBeVisible();
}

test("login, creates a transaction, marks it paid and uses quick entry", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: /Lancamentos/i }).click();
  await page.getByRole("button", { name: /\+ Nova/i }).click();
  await page.getByPlaceholder("Ex: Supermercado").fill("Mercado E2E");
  await page.getByPlaceholder("0,00").fill("89.90");
  await page.getByRole("button", { name: /Adicionar/i }).click();

  await expect(page.getByText("Mercado E2E")).toBeVisible();
  await page.getByTitle(/Pendente|Previsto|Vencido/i).first().click();
  await expect(page.getByText("Pago").first()).toBeVisible();

  await page.getByRole("button", { name: "Entrada rápida" }).click();
  await page.getByPlaceholder(/paguei 89,90/i).fill("paguei 45 no mercado hoje categoria Outros");
  await page.getByRole("button", { name: /Confirmar/i }).click();

  await expect(page.getByText("no mercado")).toBeVisible();
});

test("imports a small OFX statement", async ({ page }) => {
  await login(page);

  await page.getByRole("button", { name: /Importar/i }).first().click();
  await page.locator("#ofx-file-input").setInputFiles({
    name: "extrato.ofx",
    mimeType: "text/plain",
    buffer: Buffer.from(`
      <OFX><BANKTRANLIST>
        <STMTTRN>
          <TRNAMT>-32.50
          <DTPOSTED>20260505120000
          <FITID>ofx-e2e-1
          <MEMO>Padaria E2E
        </STMTTRN>
      </BANKTRANLIST></OFX>
    `)
  });

  await expect(page.getByText(/1 lancamento/i)).toBeVisible();
  await page.getByRole("button", { name: /Importar 1/i }).click();
  await page.getByRole("button", { name: /Lancamentos/i }).click();

  await expect(page.getByText("Padaria E2E")).toBeVisible();
});
