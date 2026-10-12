import { Page, test, expect } from '@playwright/test';
import { TableComponent } from '@ui/components/table.component';
import { BasePage } from '@ui/pages/base.page';
import { CreateFCLQuotationPage } from '../quotation/create-fcl-quotation-page';

export class FCLBuyingPage extends BasePage {
    readonly table: TableComponent;
    readonly createFCLQuotationPage: CreateFCLQuotationPage;

    constructor(page: Page) {
        super(page, 'pricing/fcl/fcl-buying', 'FCL Buying');
        this.table = new TableComponent(page.getByRole('table'));

        this.createFCLQuotationPage = new CreateFCLQuotationPage(page);
    }

    async getTabCount(tabName: string): Promise<number> {
        const text = await this.page
            .locator('.filter-tab-item', { hasText: tabName })
            .locator('span')
            .innerText();

        const match = text.match(/\((\d+)\)/);
        return match ? parseInt(match[1], 10) : 0;
    }

    async waitForTabCountGreaterThanZero(tabName: string, timeout = 10000): Promise<void> {
        await expect
            .poll(async () => this.getTabCount(tabName), { timeout })
            .toBeGreaterThan(0);
    }

    async openQuickCreateQuotation(code: string): Promise<void> {
        await test.step(`Mở "Create FCL Quotation" từ giá mua "${code}"`, async () => {
            const row = await this.table.getRowByColumnValue('Code', code);
            await this.table.clickActionInRow(
                row,
                'Quickly create a Quotation',
                () => this.createFCLQuotationPage.waitForNetworkCallback(),
            );
            await this.createFCLQuotationPage.waitForLoaded();
        });
    }

    async openTabAccepted(): Promise<void> {
        await test.step('Mở tab Accepted', async () => {
            //Đợi tab hiển thị số lượng
            await this.waitForTabCountGreaterThanZero('Accepted');
            //Click tab 'Accepted'
            await this.clickTab('Accepted');
        });
    }
}
