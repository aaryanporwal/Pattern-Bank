import { test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("generate OG image", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 630 });
  const filePath = path.resolve(__dirname, "og-image.html");
  await page.goto(`file://${filePath}`);
  await page.screenshot({ path: "public/og-image.png", fullPage: true });
});
