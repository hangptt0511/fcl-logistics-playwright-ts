import { Page, Locator, expect, test } from '@playwright/test';
import { NgSelectCustomComponent, NgxCustomSearchComponent } from '@ui/components/combobox.component';
import { NgxInputComponent } from '@ui/components/input.component';
import { FCLQuotationData } from '@ui/models/fcl-quotation.model';
import { parseNumber } from '@utils/component.helper';
import { EditPage } from '@ui/components/edit-page.component';
import { FormField } from '@utils/verification/form-verification';
import { ENDPOINTS } from '@api/core/endpoints';
import { ConfirmDialog } from '@ui/components/confirm-dialog.component';
import { save_confirm_msg } from '@ui/validators/create-fcl-quotation.validator';

export class CreateFCLQuotationPage extends EditPage {
    readonly customerCombobox: NgxCustomSearchComponent;
    readonly containerTypeCombobox: NgxCustomSearchComponent;
    readonly weightRangeCombobox: NgxCustomSearchComponent;
    readonly placeOfLoadingCombobox: NgxCustomSearchComponent;
    readonly placeOfDischargeCombobox: NgxCustomSearchComponent;
    readonly weekdaysCombobox: NgSelectCustomComponent;
    readonly currencyCombobox: NgxCustomSearchComponent;
    readonly vatRateInput: NgxInputComponent;
    readonly cargoTypeCombobox: NgSelectCustomComponent;
    readonly netWeightInput: NgxInputComponent;
    readonly noteInput: Locator;
    readonly saleCostInput: NgxInputComponent;
    readonly totalInput: Locator;
    readonly profitInput: Locator;
    readonly grossWeightInput: Locator;
    readonly saveButton: Locator;
    readonly informationHeading: Locator;
    readonly confirmDialog: ConfirmDialog;

    constructor(page: Page) {
        super(page, 'quotation/fcl-quotation', 'Create FCL Quotation');
        this.informationHeading = page.getByRole('heading', { name: 'Information' });
        this.customerCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search[formcontrolname='Customer']"));
        this.containerTypeCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search-mask[formcontrolname='Unit']"));
        this.cargoTypeCombobox = new NgSelectCustomComponent(page.locator("ng-select-custom[formcontrolname='Cargo']"));
        this.netWeightInput = new NgxInputComponent(page.locator("ngx-input-money[formcontrolname='NetWeight']"));
        this.grossWeightInput = page.getByPlaceholder('Gross Weight', { exact: true });
        this.weightRangeCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search-mask[formcontrolname='WeightRange']"));
        this.placeOfLoadingCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search-mask[formcontrolname='POL']"));
        this.placeOfDischargeCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search-mask[formcontrolname='POD']"));
        this.weekdaysCombobox = new NgSelectCustomComponent(page.locator("ng-select-custom[formcontrolname='Weekdays']"));
        this.currencyCombobox = new NgxCustomSearchComponent(page.locator("ngx-custom-search[formcontrolname='currency']"));
        this.vatRateInput = new NgxInputComponent(page.locator('ngx-input-money[formcontrolname="vatRate"]'));
        this.saleCostInput = new NgxInputComponent(page.locator("ngx-input-money[formcontrolname='SaleCost']"));
        this.totalInput = page.getByPlaceholder('Total');
        this.profitInput = page.getByPlaceholder('Profit');
        this.noteInput = page.getByPlaceholder('Note', { exact: true });
        this.saveButton = this.buttonByText('Save');
        this.confirmDialog = new ConfirmDialog(this.dialogByText(save_confirm_msg));
    }

    get fields(): FormField[] {
        return [
            this.customerCombobox,
            this.containerTypeCombobox,
            this.cargoTypeCombobox,
            this.netWeightInput,
            this.weightRangeCombobox,
            this.placeOfLoadingCombobox,
            this.placeOfDischargeCombobox,
            this.weekdaysCombobox,
            this.currencyCombobox,
        ];
    }

    async waitForLoaded(): Promise<void> {
        await super.waitForLoaded();
        await expect(this.informationHeading).toBeVisible();
        await this.loaderImg.waitFor({ state: 'hidden' });
    }

    async backToList(): Promise<void> {
    }

    async waitForNetworkCallback(): Promise<unknown> {
        return await Promise.all([
            this.page.waitForResponse(res => res.url().includes(ENDPOINTS.REFERENCE_DATA.WEIGHTRANGE) && res.status() === 200),
            this.page.waitForResponse(res => res.url().includes(ENDPOINTS.REFERENCE_DATA.CUSTOMER) && res.status() === 200),
        ]);
    }

    /** Thêm mới Create FCL Quotation */
    async save(data: FCLQuotationData) {
        await this.fill(data);
        await this.saveButton.click();
    }

    /**
     * Nhập dữ liệu
     */
    async fill(data: FCLQuotationData) {
        if (data.customer) await this.customerCombobox.searchAndSelect(data.customer);
        if (data.cargoType) await this.cargoTypeCombobox.searchAndSelect(data.cargoType);

        if (data.netWeight !== undefined && data.netWeight > 0) {
            const before = await this.grossWeightInput.inputValue();

            await this.netWeightInput.fill('');
            await this.netWeightInput.fill(data.netWeight.toString());

            //Đợi grossWeightInput cập nhật
            await expect.poll(async () => this.grossWeightInput.inputValue()).not.toBe(before);
        }
        if (data.saleCost !== undefined && data.saleCost > 0) {
            const total_before = await this.totalInput.inputValue();
            const profit_before = await this.profitInput.inputValue();

            await this.saleCostInput.fillMoney(data.saleCost.toString());

            //Đợi total, profit cập nhật
            await expect.poll(async () => this.totalInput.inputValue()).not.toBe(total_before);
            await expect.poll(async () => this.grossWeightInput.inputValue()).not.toBe(profit_before);

            data.total = parseNumber(await this.totalInput.inputValue());
            data.profit = parseNumber(await this.profitInput.inputValue());
        }
        if (data.note) await this.noteInput.fill(data.note);
        return data;
    }
}