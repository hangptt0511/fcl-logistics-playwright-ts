import { Page, test } from '@playwright/test';
import { TableComponent } from '@ui/components/table.component';
import { BasePage } from '@ui/pages/base.page';
import { RequestDialog } from '@ui/components/request-dialog.component';
import { FCLQuotationData } from '@ui/models/fcl-quotation.model';
import { WithCode } from '@ui/validators/base.validator';

export class FCLQuotationListPage extends BasePage {
    readonly table: TableComponent;
    readonly acceptDialog: RequestDialog;

    constructor(page: Page) {
        super(page, 'pricing/fcl/fcl-quotation-list', 'FCL Quotation List');
        this.table = new TableComponent(page.getByRole('table'));

        this.acceptDialog = new RequestDialog(this.dialogByTitle('Accept Quotation'), 'Accept');
    }

    /** Mở dialog Accept và chờ sẵn sàng */
    private async openAcceptDialog(data: WithCode<FCLQuotationData>): Promise<void> {
        await this.clickTab('Pending');
        const row = await this.table.getRowByColumnValue('Code', data.code);
        await this.table.clickActionInRow(row, 'Accept');
        await this.acceptDialog.waitForOpen();
    }

    async accept(data: WithCode<FCLQuotationData>) {
        return await test.step('Mở form Accept Quotation, nhấn Accept', async () => {
            await this.openAcceptDialog(data);
            await this.acceptDialog.submit();
        });
    }
}
