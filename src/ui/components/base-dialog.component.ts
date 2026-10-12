import { Locator } from '@playwright/test';
import { escapeRegExp } from '@utils/verification/data-verification';

/**
 * Lớp cha BaseDialog cung cấp các phương thức dùng chung cho các DialogObject.
 * @param root Locator của phần tử gốc của dialog (modal container)
 */
export abstract class BaseDialog {
  readonly xButton: Locator;

  constructor(readonly root: Locator) {
    this.xButton = root.locator("button.close i.icon-x")
  }

  /**
   * Chờ dialog hiện ra.
   * Lưu ý: chỉ đảm bảo khung dialog đã hiện, chưa đảm bảo nội dung đã nạp xong từ API.
   * Các hàm đọc dữ liệu trong dialog con tự chờ phần nội dung của chúng.
   */
  async waitForOpen(): Promise<void> {
    await this.root.waitFor({ state: 'visible' });
  }

  /** Chờ dialog đóng hẳn */
  async waitForClosed(): Promise<void> {
    await this.root.waitFor({ state: 'hidden' });
  }

  /** Bấm nút x và chờ dialog đóng */
  async close(): Promise<void> {
    await this.xButton.click();
    await this.waitForClosed();
  }

  /** Nút khớp toàn bộ text hiển thị, bỏ qua glyph icon font trong accessible name */
  protected buttonByText(text: string): Locator {
    return this.root
      .getByRole('button')
      .filter({ hasText: new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`) });
  }

  /**
 * Dialog đang mở không. Trả về ngay, không chờ (khác waitForOpen).
 * Dùng để kiểm tra trạng thái tức thời, ví dụ Save bị chặn thì dialog vẫn mở.
 */
  async isOpen(): Promise<boolean> {
    return this.root.isVisible();
  }
}