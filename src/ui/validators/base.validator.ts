import { expect, test, Locator } from '@playwright/test';
import { diffFieldErrors } from '@utils/verification/ui-error.util';
import { RecordView } from './record-view';
import { TableComponent } from '@ui/components/table.component';
import { TableValidator} from '@ui/validators/table.validator';
import { ExpectedFieldError } from '@ui/models/fcl-booking.model';
import { FlexibleColumnMap } from '@utils/verification/data-verification';

/** Data đã tạo thành công: data nhập vào + mã do server sinh (status đã nằm trong model nên không khai báo lại) */
export type WithCode<T> = T & { code: string };

/**
 * Base validator của tầng UI (một class duy nhất).
 *
 * Gồm 3 nhóm:
 *  1. Primitive: soft/step, expectVisible/Hidden/Text/Value
 *  2. Lỗi validation trên form: expectFieldErrors
 *  3. Danh sách + màn hình xem/sửa bản ghi: expectRowInTable, expectDetailView, expectEditView
 *
 * Nhóm 3 là TUỲ CHỌN: feature nào có thành phần nào thì override getter tương ứng
 * (table + tableColumnMap, detailView, editView). Không khai báo mà gọi nhầm sẽ báo lỗi rõ ràng.
 * Màn hình chỉ có form (không có danh sách) có thể kế thừa mà không khai báo gì ở nhóm 3.
 */
export abstract class BaseValidator<TData extends object = object> {
    protected constructor(private readonly useSoft: boolean = true) { }

    // ===== 1. Primitive =====

    /** expect.soft hoặc expect tuỳ cấu hình; mặc định soft để một lần chạy thấy đủ lỗi */
    protected get check(): typeof expect {
        return (this.useSoft ? expect.soft : expect) as typeof expect;
    }

    protected step<R>(title: string, body: () => Promise<R>): Promise<R> {
        return test.step(title, body);
    }

    protected async expectVisible(locator: Locator, label?: string): Promise<void> {
        await this.check(locator, label).toBeVisible();
    }

    protected async expectHidden(locator: Locator, label?: string): Promise<void> {
        await this.check(locator, label).toBeHidden();
    }

    protected async expectText(locator: Locator, expected: string | RegExp, label?: string): Promise<void> {
        await this.check(locator, label).toHaveText(expected);
    }

    protected async expectValue(locator: Locator, expected: string | RegExp, label?: string): Promise<void> {
        await this.check(locator, label).toHaveValue(expected);
    }

    protected async expectToast(toast: Locator, text: string | RegExp, label?: string): Promise<void> {
        await expect(toast.filter({ hasText: text }), label ?? `Toast "${text}"`).toBeVisible();
    }

    async expectSaveSuccess(locator: Locator): Promise<void> {
        await this.step('Kiểm tra Save thành công', async () => {
            await this.expectVisible(locator);
        });
    }

    // ===== 2. Lỗi validation =====

    /** So sánh lỗi validation thực tế với kỳ vọng; đính kèm diff vào report khi lệch */
    async expectFieldErrors(actual: ExpectedFieldError[], expected: ExpectedFieldError[]): Promise<void> {
        await this.step('So sánh lỗi validation thực tế với kỳ vọng', async () => {
            const diff = diffFieldErrors(actual, expected);
            const hasDiff = diff.missing.length + diff.wrongMessage.length > 0;

            if (hasDiff) {
                await test.info().attach('ErrorDiff.json', {
                    body: JSON.stringify({ diff, expected, actual }, null, 2),
                    contentType: 'application/json',
                });
            }

            this.check(diff.missing, `Field kỳ vọng báo lỗi nhưng UI không báo:\n${diff.missing.join('\n')}`).toEqual([]);
            this.check(diff.wrongMessage, `Field báo lỗi đúng nhưng sai nội dung:\n${diff.wrongMessage.join('\n')}`).toEqual([]);
        });
    }

    // ===== 3. Danh sách + xem/sửa bản ghi (tuỳ chọn) =====

    // ---- Lớp con override khi có ----
    protected get table(): TableComponent | undefined { return undefined; }
    protected get tableColumnMap(): FlexibleColumnMap<TData> | undefined { return undefined; }
    protected get detailView(): RecordView<WithCode<TData>> | undefined { return undefined; }
    protected get editView(): RecordView<WithCode<TData>> | undefined { return undefined; }

    /** Cột dùng làm khoá nhận diện dòng; feature nào khác tên cột thì override */
    protected readonly rowKeyColumn: string = 'Code';

    private requireTable(): { table: TableComponent; columnMap: FlexibleColumnMap<TData> } {
        const table = this.table;
        const columnMap = this.tableColumnMap;
        if (!table || !columnMap) {
            throw new Error(`[${this.constructor.name}] Chưa khai báo table và tableColumnMap`);
        }
        return { table, columnMap };
    }

    /** Tìm dòng theo khoá duy nhất (Code), không phụ thuộc thứ tự bảng */
    protected async findRow(code: string): Promise<Locator> {
        const { table } = this.requireTable();
        return await table.getRowByColumnValue(this.rowKeyColumn, code);
    }

    async expectRowInTable(data: WithCode<TData>): Promise<void> {
        await this.step('Kiểm tra dữ liệu trên danh sách', async () => {
            const { table, columnMap } = this.requireTable();
            const row = await this.findRow(data.code);
            await new TableValidator(table).expectRowData(row, columnMap, data);
        });
    }

    async expectDetailView(data: WithCode<TData>): Promise<void> {
        await this.expectView(this.detailView, data);
    }

    async expectEditView(data: WithCode<TData>): Promise<void> {
        await this.expectView(this.editView, data);
    }

    /** Mở màn hình từ dòng của bản ghi -> đối chiếu -> đóng; dùng chung cho dialog và trang riêng */
    private async expectView(
        view: RecordView<WithCode<TData>> | undefined,
        data: WithCode<TData>,
    ): Promise<void> {
        if (!view) {
            throw new Error(`[${this.constructor.name}] Chưa khai báo màn hình (override detailView/editView)`);
        }
        await this.step(`Kiểm tra dữ liệu trong màn hình ${view.title}`, async () => {
            const row = await this.findRow(data.code);
            await view.open(row);
            await view.expectData(data);
            await view.close();
        });
    }
}