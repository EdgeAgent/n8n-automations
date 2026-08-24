import { expect, test } from "@playwright/test";

test.use({
  browserName: "chromium",
  launchOptions: { executablePath: "/usr/bin/chromium", args: ["--no-sandbox", "--use-angle=swiftshader"] },
});

test("JARVIS accepts a typed follow-up using the immediately retained conversation", async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto("http://127.0.0.1:3000/?conversation-smoke=1");

  const command = page.getByRole("textbox", { name: "JARVIS wake-word command" });
  const answer = page.locator(".lucy-briefing > p");
  await command.fill("I have an hour to study. Can you give me a simple plan?");
  await page.getByRole("button", { name: "Send command" }).click();
  await expect(answer).toContainText(/minute|study|focus/i, { timeout: 35_000 });
  const firstAnswer = await answer.textContent();

  await command.fill("Make that a 30-minute version instead.");
  await page.getByRole("button", { name: "Send command" }).click();
  await expect(answer).toContainText(/30[- ]minute/i, { timeout: 35_000 });
  const secondAnswer = await answer.textContent();

  expect(firstAnswer).toBeTruthy();
  expect(secondAnswer).toMatch(/30[- ]minute/i);
});
