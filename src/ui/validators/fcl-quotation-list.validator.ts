import { BaseValidator } from './base.validator';
import { FCLQuotationListPage } from '@ui/pages/quotation/fcl-quotation-list.page';
import { TableColumnMap } from '@ui/models/fcl-quotation.model';
import { FCLQuotationData } from '@ui/models/fcl-quotation.model';

export class FCLQuotatinListValidator extends BaseValidator<FCLQuotationData> {
    constructor(private readonly p: FCLQuotationListPage) {
        super();
    }

    protected get table() { return this.p.table; }
    protected get tableColumnMap() { return TableColumnMap; }

    async expectAccepted(): Promise<void> {
        await this.step('Kiểm Accept lưu thành công', async () => {
            await this.expectVisible(this.p.successMsg, 'Toast Accept thành công');
        });
    }
}