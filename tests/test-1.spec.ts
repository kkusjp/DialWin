import { test, expect } from "@playwright/test";
import { SignUpPage } from "../pages/SignUpPage";
import dotenv from "dotenv";

dotenv.config();

test.describe("Sign Up Flow (POM)", () => {
  let signUpPage: SignUpPage;

  test.beforeEach(async ({ page }) => {
    signUpPage = new SignUpPage(page);
    await signUpPage.goto();
  });

  test("test sign up privacy", async ({ page }) => {
    await expect(page.getByText("Create Your CRM Account")).toBeVisible();
    const popup = await signUpPage.openPrivacyPolicy();
    await expect(popup.getByText("01IntroductionDialwin CRM (“")).toBeVisible();
  });

  test("test sign up terms", async ({ page }) => {
    const popup = await signUpPage.openTermsOfService();
    await expect(popup.getByText("01IntroductionThis Subscriber")).toBeVisible();
  });

  test("test sign up SMS", async ({ page }) => {
    const popup = await signUpPage.openSMSPolicy();
    await expect(
      popup.getByText(
        "01Purpose of SMS MessagesDialwin CRM sends transactional SMS messages",
      ),
    ).toBeVisible();
  });

  test("test sign up uncheck checkbox terms", async ({ page }) => {
    await expect(signUpPage.privacyCheckbox).toBeVisible();
    await expect(signUpPage.smsCheckbox).toBeVisible();

    await signUpPage.clickNextStep();

    await expect(page.getByText("You must agree to the Privacy")).toBeVisible();
    await expect(page.getByText("You must agree to the SMS")).toBeVisible();
  });

  test("test sign up check one checkbox", async ({ page }) => {
    await signUpPage.privacyCheckbox.check();
    await expect(signUpPage.privacyCheckbox).toBeChecked();

    await signUpPage.clickNextStep();
    await expect(page.getByText("You must agree to the SMS")).toBeVisible();

    await signUpPage.privacyCheckbox.uncheck();
    await signUpPage.smsCheckbox.check();
    await signUpPage.clickNextStep();
    await expect(page.getByText("You must agree to the Privacy")).toBeVisible();
  });

  test("test sign up invalid email", async ({ page }) => {
    await signUpPage.agreeToAll();
    await signUpPage.clickNextStep();
    await signUpPage.waitForEmailInput();
    
    await signUpPage.fillEmail("asfdaf");
    await signUpPage.clickNext();
    
    await expect(signUpPage.getInvalidEmailErrorMessage()).toBeVisible();
  });

  test("test sign up valid email", async ({ page }) => {
    await signUpPage.agreeToAll();
    await signUpPage.clickNextStep();
    await signUpPage.waitForEmailInput();
    
    await signUpPage.fillEmail("asfdaf@test.com");
    await signUpPage.clickNext();
    
    await expect(signUpPage.getVerificationHeader()).toBeVisible();
  });
});
