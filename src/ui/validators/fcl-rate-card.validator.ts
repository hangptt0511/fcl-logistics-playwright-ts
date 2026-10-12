import { BaseValidator } from './base.validator';
import { FCLRateCardPage } from '@ui/pages/pricing/fcl-rate-card/fcl-rate-card.page';
import { TableColumnMap, FCLRateCardData } from '@ui/models/fcl-rate-card.model';
import { escapeRegExp } from '@utils/verification/data-verification';

const SAVED = 'Successfully saved rate card with code';
export const RATE_CARD_MSG = {
    /** Page dùng để trích mã từ toast: nhóm 1 là mã. Không thêm cờ g (regex có cờ g giữ trạng thái giữa các lần exec). */
    savedPattern: new RegExp(`${escapeRegExp(SAVED)}\\s*:?\\s*(\\S+)`, 'i'),
    /** Validator dùng để kiểm tra toast chứa đúng mã vừa lưu */
    saved: (code: string) => new RegExp(`${escapeRegExp(SAVED)}\\s*:?\\s*${escapeRegExp(code)}`, 'i'),
    requestApprovalSuccess: (code: string) => `Send approval request for rate card ${code} successful`,
    accepted: 'Accepted successfully',
    convert_booking_confirm_msg: 'Are you sure to convert this Quotation Route to Booking?',
    converted: 'Converted to Booking',
} as const;

export class FCLRateCardValidator extends BaseValidator<FCLRateCardData> {
    constructor(private readonly p: FCLRateCardPage) {
        super();
    }

    protected get table() { return this.p.table; }
    protected get tableColumnMap() { return TableColumnMap; }

    /** Cổng sau khi Save: kiểm tra toast và trả về mã bảng giá lấy từ toast */
    async expectSaveRateCardSuccess(code: string): Promise<void> {
        await this.step('Kiểm tra Save thành công', () =>
            this.expectToast(this.p.successMsg, RATE_CARD_MSG.saved(code)));
    }

    async expectRequestApprovalSuccess(code: string): Promise<void> {
        await this.step('Kiểm tra Send Request thành công', () =>
            this.expectToast(this.p.successMsg, RATE_CARD_MSG.requestApprovalSuccess(code)));
    }

    async expectApproveSuccess(): Promise<void> {
        await this.step('Kiểm tra Approve thành công', () =>
            this.expectToast(this.p.successMsg, RATE_CARD_MSG.accepted));
    }

    async expectConvertSuccess(): Promise<void> {
        await this.step('Kiểm tra Convert Booking thành công', () =>
             this.expectToast(this.p.successMsg, RATE_CARD_MSG.converted));
    }

    async expectConvertConfirmMessage(): Promise<void> {
        await this.step('Kiểm tra câu hỏi xác nhận Convert Booking', async () => {
            await this.expectText(this.p.confirmDialog.message, RATE_CARD_MSG.convert_booking_confirm_msg);
        });
    }
}