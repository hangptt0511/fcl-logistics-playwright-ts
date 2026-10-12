import { Page, Locator, test } from '@playwright/test';
import { TableComponent } from '@ui/components/table.component';
import { BasePage } from '@ui/pages/base.page';
import { CreateSellingDialog } from '@ui/pages/pricing/fcl-rate-card/create-selling-dialog.component';
import { RateCardInfomationDialog } from '@ui/pages/pricing/fcl-rate-card/rate-card-infomation-dialog.component';
import { RequestDialog } from '@ui/components/request-dialog.component';
import { ConvertBoookingDialog } from '@ui/pages/pricing/fcl-rate-card/convert-booking-dialog.component';
import { FCLRateCardData } from '@ui/models/fcl-rate-card.model';
import { FCLBookingData } from '@ui/models/fcl-booking.model';
import { RATE_CARD_MSG } from '@ui/validators/fcl-rate-card.validator';
import { ConfirmDialog } from '@ui/components/confirm-dialog.component';

export class FCLRateCardPage extends BasePage {
    readonly tableComponent: TableComponent;
    readonly addNewRateCardButton: Locator;
    readonly table: TableComponent;
    readonly createSellingDialog: CreateSellingDialog;
    readonly rateCardInfoDialog: RateCardInfomationDialog;
    readonly switchToDetailModeButton: Locator;
    readonly acceptDialog: RequestDialog;
    readonly sendRequestDialog: RequestDialog;
    readonly convertBookingDialog: ConvertBoookingDialog;
    readonly confirmDialog: ConfirmDialog;

    constructor(page: Page) {
        super(page, 'pricing/fcl/fcl-rate-card-list', 'FCL Rate Card');
        this.tableComponent = new TableComponent(page.getByRole('table'));
        this.addNewRateCardButton = page.getByTitle('Add New Rate Card', { exact: true });
        this.switchToDetailModeButton = page.getByText('switch to Detail mode', { exact: true });

        this.table = new TableComponent(page.getByRole('table'));

        // Locator lazy nên khởi tạo trước khi modal mở vẫn an toàn
        this.createSellingDialog = new CreateSellingDialog(this.dialogByTitle('Create Selling'));
        this.rateCardInfoDialog = new RateCardInfomationDialog(this.dialogByTitle('Rate Card Infomation'));
        this.sendRequestDialog = new RequestDialog(this.dialogByTitle('Request Approval Rate Card'), 'Send Request');
        this.acceptDialog = new RequestDialog(this.dialogByTitle('Accept Rate Card'), 'Accept');
        this.convertBookingDialog = new ConvertBoookingDialog(this.dialogByTitle('Convert Booking'));
        this.confirmDialog = new ConfirmDialog(this.dialogByText(RATE_CARD_MSG.convert_booking_confirm_msg));
    }

    async openCreateSellingDialog(): Promise<CreateSellingDialog> {
        await this.addNewRateCardButton.click();
        await this.createSellingDialog.waitForOpen();
        return this.createSellingDialog;
    }

    async goNextToRateCardInfo(): Promise<RateCardInfomationDialog> {
        await this.createSellingDialog.next();
        await this.rateCardInfoDialog.waitForOpen();
        return this.rateCardInfoDialog;
    }

    async openRequestApprovalRateCardDialog(code: string): Promise<RequestDialog> {
        const row = await this.table.getRowByColumnValue('Code', code);
        await this.table.clickActionInRow(row, 'Send Request');
        await this.sendRequestDialog.waitForOpen();
        return this.sendRequestDialog;
    }

    async openAcceptRateCardDialog(code: string): Promise<RequestDialog> {
        const row = await this.table.getRowByColumnValue('Code', code);
        await this.table.clickActionInRow(row, 'Accept');
        await this.acceptDialog.waitForOpen();
        return this.acceptDialog;
    }

    async openConvertBookingDialog(code: string): Promise<ConvertBoookingDialog> {
        const row = await this.table.getRowByColumnValue('Code', code);
        await this.table.clickActionInRow(row, 'Convert Booking');
        await this.convertBookingDialog.waitForOpen();
        return this.convertBookingDialog;
    }

    async addNewRateCard(data: FCLRateCardData): Promise<string> {
        return await test.step('Tạo bảng giá', async () => {
            const createSelling = await this.openCreateSellingDialog();
            await createSelling.selectCustomer(data);
            await createSelling.search();
            await createSelling.selectQuotationRouteByCode(data.quotationCode!);
            await createSelling.expectQuotationSelected();

            const rateCardInfo = await this.goNextToRateCardInfo();
            await rateCardInfo.fill(data);
            await rateCardInfo.save();

            return await this.readSavedRateCardCode();
        });
    }

    async requestApproval(code: string) {
        const dialog = await this.openRequestApprovalRateCardDialog(code);
        await dialog.submit();
    }

    async accept(code: string) {
        await this.clickTab('Pending');
        const dialog = await this.openAcceptRateCardDialog(code);
        await dialog.submit();
    }

    async convertBooking(code: string, data: FCLBookingData) {
        await this.clickTab('Allow Booking');
        //Chuyển chế độ xem chi tiết
        this.switchToDetailModeButton.click();
        await this.loaderImg.waitFor({ state: 'hidden' });
        const convertBookingDialog = await this.openConvertBookingDialog(code);
        await convertBookingDialog.convertBooking(data);
    }

    private async readSavedRateCardCode(): Promise<string> {
        const toast = this.successMsg.filter({ hasText: RATE_CARD_MSG.savedPattern }).first();
        await toast.waitFor({ state: 'visible' });

        const text = (await toast.innerText()).trim();
        const code = RATE_CARD_MSG.savedPattern.exec(text)?.[1];
        if (!code) throw new Error(`Toast không chứa mã Rate Card. Nội dung: "${text}"`);
        return code;
    }
}
