import { Locator } from '@playwright/test';
import { TableComponent } from '@ui/components/table.component';

/**
 * "Màn hình xem/sửa một bản ghi" mở ra từ một dòng trên danh sách.
 * Có thể là dialog hoặc một trang riêng; validator chỉ làm việc qua interface này.
 */
export interface RecordView<T> {
    readonly title: string;
    open(row: Locator): Promise<void>;
    expectData(data: T): Promise<void>;
    close(): Promise<void>;
}

export type RowAction = 'Detail' | 'Edit';

/** Màn hình là dialog: bấm action trên dòng -> chờ dialog mở -> đối chiếu -> đóng dialog */
export class DialogRecordView<T> implements RecordView<T> {
    constructor(
        readonly title: string,
        private readonly table: TableComponent,
        private readonly action: RowAction,
        private readonly dialog: { waitForOpen(): Promise<void>; close(): Promise<void> },
        private readonly verify: (data: T) => Promise<void>,
    ) { }

    async open(row: Locator): Promise<void> {
        await this.table.clickActionInRow(row, this.action);
        await this.dialog.waitForOpen();
    }

    expectData(data: T): Promise<void> {
        return this.verify(data);
    }

    close(): Promise<void> {
        return this.dialog.close();
    }
}