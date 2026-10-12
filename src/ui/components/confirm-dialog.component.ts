import { Locator, test } from '@playwright/test';
import { BaseDialog } from './base-dialog.component';

export interface ConfirmDialogOptions {
    /** Chữ trên nút xác nhận. Mặc định: 'OK' */
    okText?: string;
    /** Chữ trên nút huỷ. Mặc định: 'Cancel' */
    cancelText?: string;
}

/**
 * Dialog xác nhận có/không (vd: "Are you sure to convert this Quotation Route to Booking?").
 * Cấu trúc chung: nội dung trong `.modal-body p`, hai nút OK / Cancel ở footer, nút X ở header (kế thừa từ BaseDialog).
 * Dùng chung cho mọi dialog xác nhận cùng khuôn; dialog khác chữ nút thì truyền `options`.
 */
export class ConfirmDialog extends BaseDialog {
    readonly message: Locator;
    readonly okButton: Locator;
    readonly cancelButton: Locator;

    constructor(root: Locator, options: ConfirmDialogOptions = {}) {
        super(root);
        const { okText = 'OK', cancelText = 'Cancel' } = options;
        this.message = root.locator('.modal-body p');
        this.okButton = this.buttonByText(okText);
        this.cancelButton = this.buttonByText(cancelText);
    }

    /** Nội dung câu hỏi đang hiển thị (đã bỏ khoảng trắng thừa) */
    async getMessage(): Promise<string> {
        return (await this.message.innerText()).trim();
    }

    /**
     * Bấm OK rồi chờ dialog đóng.
     * @param waitForNetworkCallback (tuỳ chọn) chờ một response API do hành động này gây ra;
     *        được bắt đầu TRƯỚC khi bấm để không bỏ lỡ response về sớm.
     */
    async confirm(waitForNetworkCallback?: () => Promise<unknown>): Promise<void> {
        await test.step('Nhấn OK', async () => {
            await Promise.all([waitForNetworkCallback?.(), this.okButton.click()]);
            await this.waitForClosed();
        });
    }

    /** Bấm Cancel rồi chờ dialog đóng */
    async cancel(): Promise<void> {
        await test.step('Nhấn Cancel', async () => {
            await this.cancelButton.click();
            await this.waitForClosed();
        });
    }
}