import { Locator, expect } from '@playwright/test';
import { FCLBookingData } from '@ui/models/fcl-booking.model';
import { ExpectedFieldError } from '@ui/models/fcl-booking.model';
import { fillOrGetMultiCombobox, fillOrGetInput } from '@utils/component.helper';
import { BaseDialog } from '@ui/components/base-dialog.component';
import { BookingForm } from './booking-form';

export class AddBookingDialog extends BaseDialog {
    readonly saveButton: Locator;
    readonly cancelButton: Locator;
    private readonly errorMessages: Locator;
    private readonly form: BookingForm;

    constructor(readonly root: Locator) {
        super(root)
        this.form = new BookingForm(root);
        this.saveButton = this.buttonByText('Save');
        this.cancelButton = this.buttonByText('Cancel');
        this.errorMessages = root.locator('small.text-danger');
    }

    /**
     * Điền form. Trả về bản sao của data đã bổ sung giá trị mặc định lấy từ UI,
     */
    async fill(data: FCLBookingData): Promise<FCLBookingData> {
        const resolved: FCLBookingData = { ...data };

        resolved.bookingDate = await fillOrGetInput(this.form.bookingDateInput, data.bookingDate);

        if (data.serviceType === undefined) resolved.serviceType = await this.form.serviceTypeCombobox.getSingleValue();
        else await this.form.serviceTypeCombobox.select(data.serviceType);

        await this.fillSellingPriceAndCurrency(data);

        if (data.customer) await this.form.customerCombobox.selectByFilter(data.customer, 1);

        if (data.bookingCustomer) await this.form.bookingCustomerInput.fill(data.bookingCustomer);
        if (data.customerPartnerName) await this.form.customerPartnerNameInput.fill(data.customerPartnerName);

        if (data.type) await this.form.typeCombobox.searchAndSelect(data.type);

        if (data.containerType) await this.form.containerTypeCombobox.searchAndSelect(data.containerType);

        resolved.modeOfTransportName = await fillOrGetMultiCombobox(this.form.modeOfTransportNameCombobox, data.modeOfTransportName);

        if (data.realWeight !== undefined && data.realWeight > 0) {
            await this.form.grossweightInput.fill(data.realWeight.toString());
        }
        if (data.quantity !== undefined && data.quantity > 0) {
            await this.form.quantityInput.fill(data.quantity.toString());
        }

        if (data.vatRate !== undefined && data.vatRate > 0) {
            await this.form.vatRateInput.fill(data.vatRate.toString());
        }

        if (data.remark) await this.form.remarkInput.fill(data.remark);
        if (data.sealNo) await this.form.sealNoInput.fill(data.sealNo);

        resolved.pickupDate = await fillOrGetInput(this.form.pickupDateInput, data.pickupDate);
        resolved.receiptDatetime = await fillOrGetInput(this.form.receiptDatetimeInput, data.receiptDatetime);
        resolved.eTDDatetime = await fillOrGetInput(this.form.eTDDatetimeInput, data.eTDDatetime);
        resolved.eTADatetime = await fillOrGetInput(this.form.eTADatetimeInput, data.eTADatetime);
        resolved.loadingUnloadingDatetime = await fillOrGetInput(this.form.loadingUnloadingDatetimeInput, data.loadingUnloadingDatetime);
        resolved.deliveryReturnDate = await fillOrGetInput(this.form.deliveryReturnDateInput, data.deliveryReturnDate);
        resolved.closingTime = await fillOrGetInput(this.form.closingTimeInput, data.closingTime);

        if (data.releaseDatetime) await this.form.releaseDatetimeInput.fillDateTime(data.releaseDatetime);
        if (data.shippingName) await this.form.shippingNameInput.fill(data.shippingName);

        if (data.placeFrom) await this.form.placeFromCombobox.searchAndSelect(data.placeFrom);
        if (data.placeOfReceipt) await this.form.placeOfReceiptCombobox.searchAndSelect(data.placeOfReceipt);
        if (data.placeOfLoading) await this.form.placeOfLoadingCombobox.searchAndSelect(data.placeOfLoading);
        if (data.placeTo) await this.form.placeToCombobox.searchAndSelect(data.placeTo);
        if (data.placeOfLoadingUnloading) await this.form.placeOfTransferCombobox.searchAndSelect(data.placeOfLoadingUnloading);
        if (data.placeOfDischarge) await this.form.placeOfDischargeCombobox.searchAndSelect(data.placeOfDischarge);
        if (data.placeOfReturn) await this.form.placeOfDeliveryCombobox.searchAndSelect(data.placeOfReturn);

        if (data.shipper) await this.form.shipperInput.fill(data.shipper);
        if (data.consignee) await this.form.consigneeInput.fill(data.consignee);
        if (data.receiptContact) await this.form.receipContactInput.fill(data.receiptContact);
        if (data.deliveryContact) await this.form.deliveryContactInput.fill(data.deliveryContact);
        return resolved;
    }

    /**
     * Selling Price và Currency ràng buộc nhau:
     *  - Price rỗng/0 -> Currency tự động disable trên UI
     *  - Price > 0    -> Currency enable và trở thành bắt buộc chọn
     *
     * Quy ước data.currency khi price > 0:
     *  - 'USD'/'VND' : chọn giá trị đó
     *  - ''          : cố tình để trống sau khi đã enable, dùng cho case test Currency bắt buộc
     *  - undefined   : không thao tác, giữ nguyên giá trị đang có
     */
    private async fillSellingPriceAndCurrency(data: FCLBookingData) {
        if (data.sellingPrice === undefined) return;

        if (data.sellingPrice > 0) {
            await this.form.sellingPriceInput.fillMoney(data.sellingPrice.toString());

            if (data.currency === '') {
                await this.form.currencyCombobox.clearAll();   // cố tình xóa để test bắt buộc
            } else if (data.currency) {
                await this.form.currencyCombobox.selectValueByFilter(data.currency);
            }
            return;
        }
        else await this.form.sellingPriceInput.fill(data.sellingPrice.toString());
    }

    async getValidationErrors(): Promise<ExpectedFieldError[]> {
        // Save lỡ thành công: không có lỗi để đọc. Trả mảng rỗng để spec dọn bản ghi,
        // rồi expectFieldErrors sẽ báo fail vì thiếu lỗi so với kỳ vọng.
        if ((await this.waitForValidationOutcome()) === 'closed') return [];

        const errors: ExpectedFieldError[] = [];
        for (const field of this.form.fields) {
            const message = await field.getErrorMessage();
            if (message) errors.push({ label: await field.getName(), message });
        }
        return errors;
    }

    /** Số thông báo lỗi đang hiển thị (bỏ qua thẻ lỗi render sẵn nhưng ẩn) */
    private async countVisibleErrors(): Promise<number> {
        let count = 0;
        for (const el of await this.errorMessages.all()) {
            if (await el.isVisible()) count++;
        }
        return count;
    }

    /**
     * Chờ kết quả sau khi bấm Save:
     * - 'errors': có lỗi validation hiện ra (đúng kỳ vọng)
     * - 'closed': dialog đã đóng, tức Save lỡ thành công (bug)
     * Hết thời gian chờ mà chưa có kết quả nào thì fail kèm thông báo rõ ràng.
     */
    async waitForValidationOutcome(timeout = 15_000): Promise<'errors' | 'closed'> {
        let outcome: 'errors' | 'closed' | 'waiting' = 'waiting';
        await expect
            .poll(async () => {
                if ((await this.countVisibleErrors()) > 0) outcome = 'errors';
                else if (!(await this.isOpen())) outcome = 'closed';
                return outcome;
            }, { timeout, message: 'Sau khi Save: không thấy lỗi validation và dialog cũng chưa đóng' })
            .not.toBe('waiting');
        return outcome as 'errors' | 'closed';
    }
}