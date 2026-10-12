import { Locator, expect } from '@playwright/test';
import { BaseDialog } from '@ui/components/base-dialog.component';
import { NgxCustomSearchComponent } from '@ui/components/combobox.component';
import { NgxInputComponent } from '@ui/components/input.component';
import { FCLBookingData } from '@ui/models/fcl-booking.model';
import { CONVERT_BOOKING_REQUIRED_KEYS } from '@ui/models/fcl-rate-card.model';
import { fillOrGetSingleCombobox, fillOrGetInput } from '@utils/component.helper';
import { ensureHas } from '@utils/data/data.util';

export class ConvertBoookingDialog extends BaseDialog {
    readonly customerCombobox: NgxCustomSearchComponent;
    readonly pickupDateInput: NgxInputComponent;
    readonly volumeInput: NgxInputComponent;
    readonly noteInput: Locator;
    readonly convertButton: Locator;;

    constructor(root: Locator) {
        super(root);
        this.volumeInput = new NgxInputComponent(root.locator('ngx-input-money[formcontrolname="volume"]'));
        this.customerCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search-mask[formcontrolname='customerID']"));
        this.pickupDateInput = new NgxInputComponent(root.locator("ngx-datetimepicker[formcontrolname='deliveryDate']"));
        this.noteInput = this.root.getByPlaceholder('Note');
        this.convertButton = this.buttonByText('Convert');
    }

    async fill(data: FCLBookingData): Promise<FCLBookingData> {
        data.customer = await fillOrGetSingleCombobox(this.customerCombobox, data.customer);
        data.pickupDate = await fillOrGetInput(this.pickupDateInput, data.pickupDate);
        if (data.quantity !== undefined && data.quantity > 0) {
            await this.volumeInput.fill(data.quantity.toString());
        }
        if (data.remark) this.noteInput.fill(data.remark);
        return ensureHas(data, CONVERT_BOOKING_REQUIRED_KEYS, 'convertBooking');
    }

    async convertBooking(data: FCLBookingData) {
        await this.fill(data);
        await this.convertButton.click();
    }
}