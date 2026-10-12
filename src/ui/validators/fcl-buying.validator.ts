import { BaseValidator, WithCode } from './base.validator';
import { FCLBuyingPage } from '@ui/pages/pricing/fcl-buying.page';
import { EditFormColumnMap, FCLQuotationData, TableColumnMap } from '@ui/models/fcl-quotation.model';

export class FCLBuyingValidator extends BaseValidator<object> {
    constructor(private readonly p: FCLBuyingPage) {
        super();
    }

    protected get table() { return this.p.table; }
    protected get tableColumnMap() { return TableColumnMap; }

    /** Màn hình Create FCL Quotation đã mở: chỉ đối chiếu, không click, không đóng */
    async expectQuickCreateQuotationData(data: WithCode<FCLQuotationData>): Promise<void> {
        await this.step('Kiểm tra dữ liệu từ giá mua sang màn hình Create FCL Quotation', async () => {
            const page = this.p.createFCLQuotationPage;
            await page.expectData(page.fields, EditFormColumnMap, data);
        });
    }


}