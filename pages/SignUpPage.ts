import { Page, Locator } from "@playwright/test";

export class SignUpPage {
  readonly page: Page;
  readonly privacyCheckbox: Locator;
  readonly smsCheckbox: Locator;
  readonly nextStepButton: Locator;
  readonly emailInput: Locator;
  readonly nextButton: Locator;
  readonly privacyPolicyLink: Locator;
  readonly termsOfServiceLink: Locator;
  readonly smsPolicyLink: Locator;
  readonly verificationCodeInput: Locator;
  readonly verifyButton: Locator;
  readonly resendCodeButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly completeRegistrationButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.privacyCheckbox = page.getByRole("checkbox", {
      name: "I have read and agree to the",
    });
    this.smsCheckbox = page.getByRole("checkbox", {
      name: "I agree to receive",
    });
    this.nextStepButton = page.getByRole("button", { name: "Next Step" });
    this.emailInput = page.getByRole("textbox", { name: "Enter Email" });
    this.nextButton = page.getByRole("button", { name: "Next" });
    this.privacyPolicyLink = page.getByRole("link", { name: "Privacy Policy" });
    this.termsOfServiceLink = page.getByRole("link", {
      name: "Terms of Service",
    });
    this.smsPolicyLink = page.getByRole("link", { name: "View SMS Policy" });
    this.verificationCodeInput = page
      .locator("input:text, input[type='text'], input[type='tel']")
      .filter({ hasText: /code|otp|security/i })
      .or(page.getByPlaceholder(/code|otp|security/i, { exact: false }))
      .or(page.getByLabel(/code|otp|security/i, { exact: false }))
      .or(page.locator('input[formcontrolname*="code"]'))
      .or(page.locator('input[name*="code"]'))
      .first();
    this.verifyButton = page
      .getByRole("button", { name: /verify|continue|submit|confirm|Next/i })
      .or(
        page.getByText(/verify|continue|submit|confirm|Next/i, {
          exact: false,
        }),
      )
      .first();
    this.resendCodeButton = page
      .getByRole("button", { name: /resend/i })
      .or(page.getByText(/resend/i, { exact: false }))
      .first();
    this.firstNameInput = page.getByRole("textbox", { name: /first name/i });
    this.lastNameInput = page.getByRole("textbox", { name: "Last Name" });
    this.passwordInput = page.locator('input[type="password"]').first();
    this.confirmPasswordInput = page.locator('input[type="password"]').last();
    this.completeRegistrationButton = page.getByRole("button", {
      name: "Complete Registration",
    });
  }

  async goto() {
    await this.page.goto("/sign-up");
  }

  async navigateToEmailStep() {
    await this.agreeToAll();
    await this.clickNextStep();
    await this.waitForEmailInput();
  }

  async agreeToAll() {
    await this.privacyCheckbox.check();
    await this.smsCheckbox.check();
  }

  async clickNextStep() {
    await this.nextStepButton.click();
  }

  async waitForEmailInput() {
    await this.emailInput.waitFor({ state: "visible", timeout: 65000 });
  }

  async fillEmail(email: string) {
    await this.emailInput.click();
    await this.emailInput.fill(email);
  }

  async clickNext() {
    await this.nextButton.click();
  }

  async fillVerificationCode(code: string) {
    await this.verificationCodeInput.fill(code);
  }

  async clickVerify() {
    await this.verifyButton.click();
  }

  async fillProfileInfo(firstName: string, lastName: string, password: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
  }

  async clickCompleteRegistration() {
    await this.completeRegistrationButton.click();
  }

  getInvalidEmailErrorMessage() {
    return this.page
      .locator("mat-error")
      .getByText(/Please enter a valid email/i);
  }

  getVerificationHeader() {
    return this.page.getByText(/verification code/i);
  }

  async openPrivacyPolicy() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.privacyPolicyLink.click();
    return await page1Promise;
  }

  async openTermsOfService() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.termsOfServiceLink.click();
    return await page1Promise;
  }

  async openSMSPolicy() {
    const page1Promise = this.page.waitForEvent("popup");
    await this.smsPolicyLink.click();
    return await page1Promise;
  }
}
