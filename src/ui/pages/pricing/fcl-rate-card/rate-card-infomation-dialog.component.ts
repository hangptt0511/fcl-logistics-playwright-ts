import { Locator, expect } from '@playwright/test';
import { CBOContractComponent } from '@ui/components/combobox.component';
import { BaseDialog } from '@ui/components/base-dialog.component';
import { FCLRateCardData } from '@ui/models/fcl-rate-card.model';
import { NgxInputComponent } from '@ui/components/input.component';
import { fillOrGetInput } from '@utils/component.helper';

export class RateCardInfomationDialog extends BaseDialog {
    readonly rateCardNameInput: Locator;
    readonly contractCombobox: CBOContractComponent;
    readonly effectiveDateInput: NgxInputComponent;
    readonly expiredDateInput: NgxInputComponent;
    readonly saveButton: Locator;

    constructor(root: Locator) {
        super(root);
        this.rateCardNameInput = this.root.locator("input[formcontrolname='name']");
        this.contractCombobox = new CBOContractComponent(root.locator("cbo-contract[formcontrolname='contractId']"));
        this.effectiveDateInput = new NgxInputComponent(root.locator("ngx-datetimepicker[formcontrolname='effectiveDate']"));
        this.expiredDateInput = new NgxInputComponent(root.locator("ngx-datetimepicker[formcontrolname='effectiveDate']"));
        this.saveButton = this.buttonByText('Save')
    }

    async fill(data: FCLRateCardData) {
        if (data.rateCardName) await this.rateCardNameInput.fill(data.rateCardName);
        if (data.contractNo) await this.contractCombobox.selectByFilter(data.contractNo,1);
        data.effectedDate = await fillOrGetInput(this.effectiveDateInput, data.effectedDate);
        data.expiredDate = await fillOrGetInput(this.effectiveDateInput, data.expiredDate);
    }

    async save() { await this.saveButton.click(); }
}