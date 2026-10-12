import { Page, test, Locator, expect } from '@playwright/test';
import { escapeRegExp } from '@utils/verification/data-verification';
import { InputComponent } from '../components/input.component';

/**
 * Lớp cha BasePage cung cấp các phương thức điều hướng, chờ thông minh và tiện ích dùng chung cho các PageObject.
 */
export class BasePage {
    readonly pageHeading: Locator;
    readonly loaderImg: Locator;
    readonly successMsg: Locator;
    constructor(readonly page: Page, readonly url: string, readonly headingTitle: string) {
        this.pageHeading = this.headingByTitle(headingTitle);
        this.loaderImg = page.locator('#loader').getByRole('img');
        this.successMsg = page.locator('.alertify-notifier .ajs-message.ajs-success');
    }

    /**
     * Điều hướng tới một URL tương đối trên hệ thống.
     * 
     * @param url Đường dẫn tương đối tới trang đích.
     * @returns Đối tượng chính nó để hỗ trợ Fluent Interface.
     */
    async goto(): Promise<this> {
        await test.step(`Điều hướng tới trang: "${this.headingTitle}"`, async () => {
            await this.page.goto(`/en/#/app/${this.url}`);
            await expect(this.pageHeading).toBeVisible();
            await this.loaderImg.waitFor({ state: 'hidden' });
        });
        return this;
    }

    protected dialogByTitle(title: string): Locator {
        return this.page.getByRole('dialog').filter({
            has: this.page.getByRole('heading', { name: title }),
        });
    }

    protected tabByTitle(title: string): Locator {
        return this.page.getByRole('link', { name: title });
    }

    protected headingByTitle(title: string): Locator {
        return this.page.getByRole('heading', { name: title, exact: true });
    }

    async clickTab(text: string) {
        await test.step(`Mở tab ${text}`, async () => {
            await this.tabByTitle(text).click();
            await this.loaderImg.waitFor({ state: 'hidden' });
        });
    }

    /** Nút khớp toàn bộ text hiển thị, bỏ qua glyph icon font trong accessible name */
    protected buttonByText(text: string): Locator {
        return this.page
            .getByRole('button')
            .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`) });
    }

    protected dialogByText(text: string | RegExp): Locator {
        return this.page.locator('ngx-dialog').filter({ hasText: text });
    }

    async fillAndWaitFieldUpdate(inputA: InputComponent, value: string, fieldB: Locator) {
        const before = await fieldB.inputValue();
        await inputA.fill(value);
        await expect.poll(async () => fieldB.inputValue()).not.toBe(before);
    }
}