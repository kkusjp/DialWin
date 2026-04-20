import { test, expect } from "@playwright/test";

/*
main test cases:
*/
test("test sign up privacy", async ({ page }) => {
  await page.goto("https://staging123.ca/");
  await page.getByRole("link", { name: "Login" }).click();
  await expect(
    page.getByRole("textbox", { name: "Enter Email Address" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign Up" }).click();
  await expect(
    page
      .locator("div")
      .filter({ hasText: "Create Your CRM AccountFollow" })
      .nth(2),
  ).toBeVisible();
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Privacy Policy" }).click();
  const page1 = await page1Promise;
  await expect(page1.getByText("01IntroductionDialwin CRM (“")).toBeVisible();
});

test("test sign up terms", async ({ page }) => {
  await page.goto("https://staging123.ca/sign-up");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "Terms of Service" }).click();
  const page1 = await page1Promise;
  await expect(page1.getByText("01IntroductionThis Subscriber")).toBeVisible();
});

test("test sign up SMS", async ({ page }) => {
  await page.goto("https://staging123.ca/sign-up");
  const page1Promise = page.waitForEvent("popup");
  await page.getByRole("link", { name: "View SMS Policy" }).click();
  const page1 = await page1Promise;
  await expect(
    page1.getByText(
      "01Purpose of SMS MessagesDialwin CRM sends transactional SMS messages",
    ),
  ).toBeVisible();
});

test("test sign up uncheck checkbox terms", async ({ page }) => {
  await page.goto("https://staging123.ca/sign-up");

  await expect(
    page.getByRole("checkbox", { name: "I have read and agree to the" }),
  ).toBeVisible();

  await expect(
    page.getByRole("checkbox", { name: "I agree to receive" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Next Step" }).click();

  await expect(page.getByText("You must agree to the Privacy")).toBeVisible();
  await expect(page.getByText("You must agree to the SMS")).toBeVisible();
});

test("test sign up check one checkbox", async ({ page }) => {
  await page.goto("https://staging123.ca/sign-up");

  await page
    .getByRole("checkbox", { name: "I have read and agree to the" })
    .check();
  await expect(
    page.getByRole("checkbox", { name: "I have read and agree to the" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Next Step" }).click();
  await expect(page.getByText("You must agree to the SMS")).toBeVisible();

  await page
    .getByRole("checkbox", { name: "I have read and agree to the" })
    .uncheck();

  await page.getByRole("checkbox", { name: "I agree to receive" }).check();
  await page.getByRole("button", { name: "Next Step" }).click();
  await expect(page.getByText("You must agree to the Privacy")).toBeVisible();
});
