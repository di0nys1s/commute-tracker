import { test } from "@playwright/test";

const hrSelfServiceUrl =
  "https://selfservice.youserve.nl/hss_hre_prod/hss.net/Start.aspx";
const hrSelfServiceLoggedInUrl =
  "https://selfservice.youserve.nl/hss_hre_prod/hss.net/index.aspx?Context=false";

test("Tracker", async ({ page }) => {
  await page.goto(hrSelfServiceUrl);
  await page.waitForURL(hrSelfServiceLoggedInUrl, { timeout: 120000 });
  await page.locator("#Navigatie").contentFrame().getByTestId("Start").click();
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .getByRole("link", { name: /Mijn declaraties/ })
    .click();
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator("#tab_6")
    .getByText(/Declaratie woon-werk/)
    .click();

  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator('frame[name="Details"]')
    .contentFrame()
    .locator(
      '[id="ctl00_ContentPlaceHolder_uiSpreadControl_uiSpreadControl_FpSpread_5,3"]'
    )
    .selectOption("November");
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator('frame[name="Details"]')
    .contentFrame()
    .locator(
      '[id="ctl00_ContentPlaceHolder_uiSpreadControl_uiSpreadControl_FpSpread_10,3"]'
    )
    .selectOption("OV kosten");
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator('frame[name="Details"]')
    .contentFrame()
    .locator(
      '[id="ctl00_ContentPlaceHolder_uiSpreadControl_uiSpreadControl_FpSpread_11,3"]'
    )
    .selectOption("OV kosten");
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator('frame[name="Details"]')
    .contentFrame()
    .locator(".s41s22")
    .dblclick();
  await page
    .locator('iframe[name="Basis"]')
    .contentFrame()
    .locator('frame[name="Details"]')
    .contentFrame()
    .locator(
      "#ctl00_ContentPlaceHolder_uiSpreadControl_uiSpreadControl_FpSpread_ctl32"
    )
    .fill("100.00");
  // await page.locator('iframe[name="Basis"]').contentFrame().locator('frame[name="Details"]').contentFrame().locator('tr:nth-child(40) > td:nth-child(7)').click();
  // await page.locator('iframe[name="Basis"]').contentFrame().locator('frame[name="Details"]').contentFrame().getByRole('link', { name: 'Verder' }).click();
});
