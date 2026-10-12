import { BaseValidator } from './base.validator';
import { FCLQuotationData } from '@ui/models/fcl-quotation.model';
import { CreateFCLQuotationPage } from '@ui/pages/quotation/create-fcl-quotation-page';

export const save_confirm_msg = 'You want create new quotation?'

export class CreateFCLQuotationValidator extends BaseValidator<FCLQuotationData> {
    constructor(private readonly p: CreateFCLQuotationPage) {
        super();
    }

    async expectCreateConfirmMessage(): Promise<void> {
        await this.step('Kiểm tra câu hỏi xác nhận có muốn tiếp tục tạo mới bảng phân tích', async () => {
            await this.expectText(this.p.confirmDialog.message, save_confirm_msg);
        });
    }
}