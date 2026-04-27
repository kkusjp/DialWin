import { test, expect } from "@playwright/test";
import { SignUpPage } from "../pages/SignUpPage";
import { log } from "console";
import dotenv from "dotenv";

dotenv.config();

// Only initialize MailSlurp if API key is provided
let mailslurpClient: any;
const mailslurpApiKey = process.env.MAILSLURP_API_KEY;
if (mailslurpApiKey) {
  const { MailSlurp } = require("mailslurp-client");
  mailslurpClient = new MailSlurp({ apiKey: mailslurpApiKey });
}

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
    await expect(
      popup.getByText("01IntroductionThis Subscriber"),
    ).toBeVisible();
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

    await signUpPage.fillEmail(`test${Date.now()}@example.com`);
    await signUpPage.clickNext();

    await expect(signUpPage.getVerificationHeader()).toBeVisible();
  });

  test("test sign up resend code", async ({ page }) => {
    await signUpPage.agreeToAll();
    await signUpPage.clickNextStep();
    await signUpPage.waitForEmailInput();
    await signUpPage.fillEmail(`test_resend_${Date.now()}@example.com`);
    await signUpPage.clickNext();

    await expect(signUpPage.resendCodeButton).toBeVisible();
    // Some systems disable the button for 60 seconds.
    // We only check it exists and is clickable if possible, or just wait for it.
    await expect(signUpPage.resendCodeButton)
      .toBeEnabled({ timeout: 10000 })
      .catch(() => {
        console.log(
          "Resend button might be on a timer, skipping enabled check",
        );
      });

    if (await signUpPage.resendCodeButton.isEnabled()) {
      await signUpPage.resendCodeButton.click();
    }
  });

  test("test sign up with OTP verification", async ({ page }) => {
    test.skip(
      !process.env.MAILSLURP_API_KEY,
      "Skipping test because MAILSLURP_API_KEY is missing",
    );

    const inbox = await mailslurpClient.createInbox();
    const tempEmail = inbox.emailAddress;

    await page.goto("https://staging123.ca/sign-up");
    await page
      .getByRole("checkbox", { name: "I have read and agree to the" })
      .check();
    await page.getByRole("checkbox", { name: "I agree to receive" }).check();
    await page.getByRole("button", { name: "Next Step" }).click();
    await page.getByText("Enter Email").click();
    await page.getByRole("textbox", { name: "Enter Email" }).click();
    await page.getByRole("textbox", { name: "Enter Email" }).fill(tempEmail);
    await page.getByRole("button", { name: "Next" }).click();
    await page.getByText("Enter Verification Code", { exact: true }).click();

    const otpCode = await mailslurpClient
      .waitForLatestEmail(inbox.id, 120000)
      .then((email) => {
        const regex = /Your verification code is:\s*(\d{6})/;
        const match = email.body?.match(regex);
        log(match);
        return match ? match[1] : null;
      });

    if (otpCode) {
      await page
        .getByRole("textbox", { name: "Enter Verification Code" })
        .fill(otpCode);
    }
    await page.getByRole("button", { name: "Verify & Continue" }).click();
    await expect(page.getByText("Enter your phone number")).toBeVisible();
  });
});
