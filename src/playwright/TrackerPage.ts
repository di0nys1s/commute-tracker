import { Locator, Page } from '@playwright/test';


export class TrackerPage {
	readonly page: Page;
	readonly employeeLoginEmailTextBox: Locator;
	readonly employeeLoginNextButton: Locator;
	readonly hrSelfServiceCookiesConsentButton: Locator;

	constructor(page: Page) {
		this.page = page;
		this.employeeLoginEmailTextBox = page.getByLabel('E-mailadres');
		this.employeeLoginNextButton = page.getByRole('button', { name: 'Volgende' });
		this.hrSelfServiceCookiesConsentButton = page.getByRole('button', { name: 'Accept All Cookies' });
	}

	public async typeEmployeeEmail(email: string) {
		await this.employeeLoginEmailTextBox.fill(email);
	}

	public async clickEmployeeLoginNextButton() {
		await this.employeeLoginNextButton.click();
	}
}

