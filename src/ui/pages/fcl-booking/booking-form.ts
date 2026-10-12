import { Locator } from '@playwright/test';
import { NgxInputComponent, InputComponent } from '@ui/components/input.component';
import type { FormField } from '@utils/verification/form-verification';
import { ComboboxComponent, NgSelectCustomComponent, NgxCustomSearchComponent, NgxCustomSearchMultiComponent } from '@ui/components/combobox.component';

/**
 * Các field của form FCL Booking, dùng chung cho dialog "Add new FCL Booking"
 * và dialog "Edit FCL Booking" (hai dialog chỉ khác tiêu đề).
 *
 * Field được tạo từ `dialog` truyền vào nên luôn trỏ đúng dialog đang mở.
 */
export class BookingForm {
    // Booking Information
    readonly bookingDateInput: NgxInputComponent;
    readonly serviceTypeCombobox: ComboboxComponent;

    readonly sellingPriceInput: NgxInputComponent;
    readonly currencyCombobox: NgxCustomSearchComponent;
    readonly projectNameInput: InputComponent;

    //Customer Information
    readonly customerCombobox: NgxCustomSearchComponent;

    readonly bookingCustomerInput: InputComponent;
    readonly commodityCombobox: NgxCustomSearchComponent;
    readonly customerPartnerNameInput: InputComponent; //Customer Of Customer
    readonly typeCombobox: NgSelectCustomComponent;
    readonly containerTypeCombobox: NgxCustomSearchComponent;
    readonly modeOfTransportNameCombobox: NgxCustomSearchMultiComponent;
    readonly quantityInput: NgxInputComponent;
    readonly grossweightInput: NgxInputComponent;
    readonly pickupDateInput: NgxInputComponent;
    readonly receiptDatetimeInput: NgxInputComponent;
    readonly eTDDatetimeInput: NgxInputComponent;
    readonly eTADatetimeInput: NgxInputComponent;
    readonly loadingUnloadingDatetimeInput: NgxInputComponent;
    readonly deliveryReturnDateInput: NgxInputComponent;
    readonly shippingLineCombobox: NgxCustomSearchComponent;
    readonly closingTimeInput: NgxInputComponent;
    readonly releaseDatetimeInput: NgxInputComponent;
    readonly bookingPersonCombobox: NgxCustomSearchComponent;
    readonly shippingNameInput: InputComponent;
    readonly vatRateInput: NgxInputComponent;
    readonly customerEmailCombobox: NgxCustomSearchComponent;
    readonly sealNoInput: InputComponent;
    readonly containerCombobox: NgxCustomSearchComponent;
    readonly remarkInput: InputComponent; //Note

    //Route
    readonly placeFromCombobox: NgxCustomSearchComponent;
    readonly placeOfReceiptCombobox: NgxCustomSearchComponent;
    readonly placeOfLoadingCombobox: NgxCustomSearchComponent;
    readonly placeToCombobox: NgxCustomSearchComponent;
    readonly placeOfTransferCombobox: NgxCustomSearchComponent;
    readonly placeOfDischargeCombobox: NgxCustomSearchComponent;
    readonly placeOfDeliveryCombobox: NgxCustomSearchComponent;
    readonly shipperInput: InputComponent;
    readonly consigneeInput: InputComponent;
    readonly receipContactInput: InputComponent;
    readonly deliveryContactInput: InputComponent;

    constructor(root: Locator) {
        this.bookingDateInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="bookingDate"]'));
        this.serviceTypeCombobox = new ComboboxComponent(root.locator("ngx-custom-search[formcontrolname='serviceType']"));
        this.projectNameInput = new InputComponent(root.locator('input[formcontrolname="projectName"]'));
        this.sellingPriceInput = new NgxInputComponent(root.locator("ngx-input-money[formcontrolname='sellingPrice']"));
        this.currencyCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='currency']"));
        this.customerCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search-mask[formcontrolname='customerid']"));
        this.bookingCustomerInput = new InputComponent(root.locator('textarea[formcontrolname="bookingCustomer"]'));
        this.bookingPersonCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='bookingPerson']"));
        this.customerEmailCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='customerEmail']"));
        this.customerPartnerNameInput = new InputComponent(root.getByRole('textbox', { name: 'Customer Partner Name', exact: true }));
        this.typeCombobox = new NgSelectCustomComponent(root.locator("ng-select-custom[formcontrolname='imExType']"));
        this.modeOfTransportNameCombobox = new NgxCustomSearchMultiComponent(root.locator("ngx-custom-search-multi[formcontrolname='modeOfTransportName']"));
        this.vatRateInput = new NgxInputComponent(root.locator('ngx-input-money[formcontrolname="vatRate"]'));

        this.containerTypeCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='containerTypeId']"));
        this.quantityInput = new NgxInputComponent(root.locator('ngx-input-money[formcontrolname="volume"]'));
        this.grossweightInput = new NgxInputComponent(root.locator('ngx-input-money[formcontrolname="realWeight"]'));
        this.containerCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='containerId']"));
        this.commodityCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='commodityId']"));

        this.shippingLineCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search-mask[formcontrolname='shippingLine']"));
        this.sealNoInput = new InputComponent(root.getByRole('textbox', { name: 'Seal No', exact: true }));
        this.remarkInput = new InputComponent(root.locator('textarea[formcontrolname="remark"]'));

        this.pickupDateInput = new NgxInputComponent(root.locator("ngx-datetimepicker[formcontrolname='deliveryDate']"));
        this.receiptDatetimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="receiptDatetime"]'));
        this.eTDDatetimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="etd"]'));
        this.eTADatetimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="eta"]'));
        this.loadingUnloadingDatetimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="loadUnLoadDatetime"]'));
        this.deliveryReturnDateInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="returnDatetime"]'));
        this.closingTimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="datetimeClosed"]'));
        this.releaseDatetimeInput = new NgxInputComponent(root.locator('ngx-datetimepicker[formcontrolname="releaseDatetime"]'));
        this.shippingNameInput = new InputComponent(root.getByPlaceholder('Shipping Name', { exact: true }));
        this.placeFromCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='placeFrom']"));
        this.placeOfReceiptCombobox = new NgxCustomSearchComponent(root.locator("app-choosing-place-group[formcontrolname='poReceipt']"));
        this.placeOfLoadingCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='placeOfLoading']"));
        this.placeToCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='placeTo']"));
        this.placeOfTransferCombobox = new NgxCustomSearchComponent(root.locator("app-choosing-place-group[formcontrolname='placeOfTransfer']"));
        this.placeOfDischargeCombobox = new NgxCustomSearchComponent(root.locator("ngx-custom-search[formcontrolname='placeOfDischarge']"));
        this.placeOfDeliveryCombobox = new NgxCustomSearchComponent(root.locator("app-choosing-place-group[formcontrolname='poDelivery']"));

        this.shipperInput = new InputComponent(root.getByRole('textbox', { name: 'Shipper', exact: true }));
        this.consigneeInput = new InputComponent(root.getByRole('textbox', { name: 'Consignee', exact: true }));
        this.receipContactInput = new InputComponent(root.getByRole('textbox', { name: 'Receip Contact', exact: true }));
        this.deliveryContactInput = new InputComponent(root.getByRole('textbox', { name: 'Delivery Contact', exact: true }));
    }

    get fields(): FormField[] {
        return [
            // Booking Information
            this.bookingDateInput,
            this.serviceTypeCombobox,
            this.sellingPriceInput,
            this.currencyCombobox,
            this.projectNameInput,

            // Customer Information
            this.customerCombobox,
            this.bookingCustomerInput,
            this.commodityCombobox,
            this.customerPartnerNameInput,
            this.typeCombobox,
            this.containerTypeCombobox,
            this.modeOfTransportNameCombobox,
            this.quantityInput,
            this.grossweightInput,
            this.pickupDateInput,
            this.receiptDatetimeInput,
            this.eTDDatetimeInput,
            this.eTADatetimeInput,
            this.loadingUnloadingDatetimeInput,
            this.deliveryReturnDateInput,
            this.shippingLineCombobox,
            this.closingTimeInput,
            this.releaseDatetimeInput,
            this.bookingPersonCombobox,
            this.shippingNameInput,
            this.vatRateInput,
            this.customerEmailCombobox,
            this.sealNoInput,
            this.containerCombobox,
            this.remarkInput,

            // Route
            this.placeFromCombobox,
            this.placeOfReceiptCombobox,
            this.placeOfLoadingCombobox,
            this.placeToCombobox,
            this.placeOfTransferCombobox,
            this.placeOfDischargeCombobox,
            this.placeOfDeliveryCombobox,
            this.shipperInput,
            this.consigneeInput,
            this.receipContactInput,
            this.deliveryContactInput,

        ];
    }
}