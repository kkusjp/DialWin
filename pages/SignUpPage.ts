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
  }

  async goto() {
    await this.page.goto("/sign-up");
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

  getInvalidEmailErrorMessage() {
    return this.page
      .locator("mat-error")
      .getByText(/Please enter a valid email/i);
  }

  getVerificationHeader() {
    return this.page.getByText("We'll send a verification code to your inbox");
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
