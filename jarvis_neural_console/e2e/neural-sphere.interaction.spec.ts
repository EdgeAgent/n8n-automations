import { expect, test } from "@playwright/test";

test.use({
  browserName: "chromium",
  launchOptions: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--use-angle=swiftshader"] },
});

test("the contained JARVIS neural sphere keeps drag, scroll, and node selection available", async ({ page }) => {
  await page.goto("http://127.0.0.1:3000/?from_webdev=1");
  const sphere = page.getByLabel(/interactive neural system graph contained in a reactive AI sphere/i);
  const canvas = sphere.locator("canvas");
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error("Neural canvas did not expose a viewport");

  await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.45);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.58, box.y + box.height * 0.52, { steps: 6 });
  await page.mouse.up();
  await expect(sphere).toHaveAttribute("data-navigation-state", "orbit");

  await page.mouse.wheel(0, 260);
  await expect(sphere).toHaveAttribute("data-navigation-state", "zoom");

  await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.5);
  await expect(page.getByText("NODE TELEMETRY")).toBeVisible();
});

test.describe("mobile containment sphere", () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test("a touch tap reaches a neural node through the sphere overlay", async ({ page }) => {
    await page.goto("http://127.0.0.1:3000/?from_webdev=1");
    const sphere = page.getByLabel(/interactive neural system graph contained in a reactive AI sphere/i);
    const canvas = sphere.locator("canvas");
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    if (!box) throw new Error("Neural canvas did not expose a touch viewport");

    await page.touchscreen.tap(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await expect(page.getByText("NODE TELEMETRY")).toBeVisible();
  });
});
