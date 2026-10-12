import { Locator, expect } from '@playwright/test';
import { NgxCustomSearchComponent } from '@ui/components/combobox.component';
import { BaseDialog } from '@ui/components/base-dialog.component';
import { TableComponent } from '@ui/components/table.component';
import { FCLRateCardData } from '@ui/models/fcl-rate-card.model';

export class CreateSellingDialog extends BaseDialog {
    readonly root: Locator;
    readonly customerCombobox: NgxCustomSearchComponent;
    readonly searchButton: Locator;
    readonly quotationTable: TableComponent;
    readonly selectedQuotationTable: TableComponent;
    readonly nextButton: Locator;


    constructor(root: Locator) {
        super(root);
        this.root = root;
        this.customerCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search-mask[formcontrolname='Customer']"));
        this.searchButton = this.buttonByText('Search')
        this.quotationTable = new TableComponent(root.locator('[name="gridQuotation"]').getByRole('table'));
        this.selectedQuotationTable = new TableComponent(root.locator('[name="gridQuotationSelected"]').getByRole('table'));
        this.nextButton = this.buttonByText('Next')
    }

    async selectCustomer(data: FCLRateCardData) {
        if (data.customer) await this.customerCombobox.selectByFilter(data.customer, 1);
    }
    async search() {
        await this.searchButton.click();
        await expect(this.quotationTable.rows.first()).toBeVisible();   // chờ có kết quả
    }

    /** Select dòng đầu của Quotation Route, trả về mã quotation để đối chiếu */
    async selectQuotationRouteByCode(code: string) {
        const row = await this.quotationTable.getRowByColumnValue('Code', code);
        await this.quotationTable.clickActionInRow(row, 'Select')
    }

    async expectQuotationSelected() {
        const rows = await this.selectedQuotationTable.getRowCount()
        await expect(rows).toBe(1);
    }

    async next() { await this.nextButton.click(); }
}