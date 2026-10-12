import { BaseValidator, WithCode } from './base.validator';
import { DialogRecordView } from './record-view';
import { FCLBookingPage } from '@ui/pages/fcl-booking/fcl-booking.page';
import { BookingForm } from '@ui/pages/fcl-booking/booking-form';
import { FCLBookingData, TableColumnMap, DetailFormColumnMap, EditFormColumnMap } from '@ui/models/fcl-booking.model';

export class FCLBookingValidator extends BaseValidator<FCLBookingData> {
    constructor(private readonly p: FCLBookingPage) {
        super();
    }

    protected get table() { return this.p.table; }
    protected get tableColumnMap() { return TableColumnMap; }

    protected get detailView() {
        return new DialogRecordView(
            'Detail Booking',
            this.table,
            'Detail',
            this.p.detailDialog,
            (d: WithCode<FCLBookingData>) => this.p.detailDialog.expectData(DetailFormColumnMap, d));
    }

    protected get editView() {
        return new DialogRecordView(
            'Edit FCL Booking',
            this.table,
            'Edit',
            this.p.editDialog,
            (d: WithCode<FCLBookingData>) =>
                this.p.editDialog.expectData(new BookingForm(this.p.editRoot).fields, EditFormColumnMap, d));
    }

    async expectSaveBlocked(): Promise<void> {
        await this.step('Kiểm tra save bị chặn', async () => {
            await this.expectVisible(this.p.addBookingDialog.root, 'Modal Add vẫn mở');
            await this.expectHidden(this.p.successMsg, 'Không có toast thành công');
        });
    }
}