import { Page, Locator, expect, test } from '@playwright/test';
import { FCLBookingData } from "@ui/models/fcl-booking.model";
import { TableComponent } from '@ui/components/table.component';
import { DetailDialog } from '@ui/components/detail-dialog.component';
import { BasePage } from '@ui/pages/base.page';
import { EditDialog } from '@ui/components/edit-dialog.component';
import { AddBookingDialog } from '@ui/pages/fcl-booking/add-booking-dialog.component';
import { ExpectedFieldError } from '@ui/models/fcl-booking.model';
import { REQUIRED_KEYS_NO_DEFAULT } from '@ui/models/fcl-booking.model';
import { ensureHas } from '@utils/data/data.util';
import { ENDPOINTS } from '@api/core/endpoints';

export class FCLBookingPage extends BasePage {
    readonly addNewBookingButton: Locator;
    readonly addBookingDialog: AddBookingDialog;
    readonly table: TableComponent;
    readonly detailDialog: DetailDialog;
    readonly editDialog: EditDialog;
    readonly editRoot: Locator;

    constructor(page: Page) {
        super(page, 'customer/fcl-booking', 'FCL Booking');
        this.addNewBookingButton = page.getByTitle('Add New Booking', { exact: true });

        // Locator lazy nên khởi tạo trước khi modal mở vẫn an toàn
        this.addBookingDialog = new AddBookingDialog(this.dialogByTitle('Add new FCL Booking'));
        this.table = new TableComponent(page.getByRole('table'));
        this.detailDialog = new DetailDialog(this.dialogByTitle('Detail Booking'));
        this.editRoot = this.dialogByTitle('Edit FCL Booking');
        this.editDialog = new EditDialog(this.dialogByTitle('Edit FCL Booking'));
    }

    async goto(): Promise<this> {
        await test.step('Điều hướng tới trang: FCL Booking', async () => {
            await Promise.all([
                this.page.waitForResponse(res => res.url().includes(ENDPOINTS.REFERENCE_DATA.CUSTOMER) && res.status() === 200),
                this.page.waitForResponse(res => res.url().includes(ENDPOINTS.REFERENCE_DATA.CONTAINER_TYPE_ALL) && res.status() === 200),
                this.page.goto('/en/#/app/customer/fcl-booking'),
            ]);
            await expect(this.pageHeading).toBeVisible();
            await this.loaderImg.waitFor({ state: 'hidden' });
        });
        return this;
    }

    /** Mở dialog Add và chờ sẵn sàng (dùng chung cho cả luồng thành công và lỗi) */
    private async openAddDialog(): Promise<void> {
        await this.addNewBookingButton.click();
        await this.addBookingDialog.waitForOpen();
        await this.loaderImg.waitFor({ state: 'hidden' });
    }

    async addNewBooking(data: FCLBookingData) {
        return await test.step('Mở Add New Booking nhập dữ liệu nhấn Save', async () => {
            await this.openAddDialog();
            const resolved = await this.addBookingDialog.fill(data);
            await this.addBookingDialog.saveButton.click();
            await expect(this.successMsg).toBeVisible();
            return ensureHas(resolved, REQUIRED_KEYS_NO_DEFAULT, 'addNewBooking');
        });
    }

    /** Điền và Save, trả về các lỗi đang hiện trên form */
    async submitInvalidBooking(data: FCLBookingData): Promise<ExpectedFieldError[]> {
        return await test.step('Mở Add New Booking nhập dữ liệu nhấn Save (kỳ vọng lỗi)', async () => {
            await this.openAddDialog();
            await this.addBookingDialog.fill(data);
            await this.addBookingDialog.saveButton.click();
            return await this.addBookingDialog.getValidationErrors();
        });
    }

    async isAddModalOpen(): Promise<boolean> {
        return this.addBookingDialog.isOpen();
    }
}