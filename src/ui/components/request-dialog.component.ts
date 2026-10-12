// request-dialog.component.ts
import { Locator, expect } from '@playwright/test';
import { BaseDialog } from './base-dialog.component';
import { InputComponent } from './input.component';

export class RequestDialog extends BaseDialog {
  readonly noteInput: InputComponent;
  readonly confirmButton: Locator;

  /**
   * @param root          Root của dialog
   * @param confirmText   Tên nút xác nhận trên form này: 'Accept', 'Send Request'
   */
  constructor(root: Locator, confirmText: string) {
    super(root);
    this.noteInput = new InputComponent(root.locator("textarea[formcontrolname='note']"));
    this.confirmButton = this.buttonByText(confirmText);
  }

  async fillNote(text: string) {
    await this.noteInput.fill(text);
  }

  /** Bấm nút xác nhận; chỉ điền ghi chú khi truyền note */
  async submit(note?: string) {
    if (note !== undefined) {
      await this.fillNote(note);
    }
    await this.confirmButton.click();
    await this.waitForClosed();
  }

  /** Dùng khi muốn kiểm tra lỗi validation (dialog vẫn mở) */
  async clickConfirmWithoutClosing() {
    await this.confirmButton.click();
  }
}