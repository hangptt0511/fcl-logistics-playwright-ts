import { Locator, expect } from '@playwright/test';
import { FlexibleColumnMap, normalizeLabel, LOADING_TEXT } from '@utils/verification/data-verification';
import {
  FieldMismatch,
  FieldReader,
  VerifyOptions,
  assertNoMismatches,
  collectMismatches,
} from '@utils/verification/field-verifier';
import { BaseDialog } from './base-dialog.component';

/**
 * Dialog xem chi tiết. Thông tin hiển thị dạng bảng gồm các cặp:
 *   <td class="text-right">Label:</td> <td class="info-text">Giá trị</td>
 * Một hàng <tr> có thể chứa nhiều cặp, nên đọc theo cặp ô chứ không theo hàng.
 */
export class DetailDialog extends BaseDialog {
  readonly infoTable: Locator;
  /** Tất cả ô label (bên trái) của bảng thông tin */
  private readonly labelCells: Locator;

  constructor(root: Locator) {
    super(root);
    this.infoTable = this.root.locator('table.info-inner');
    this.labelCells = this.infoTable.locator('tbody td.text-right');
  }

  /**
   * Đọc toàn bộ cặp label/value trong bảng thông tin.
   * Chờ có ít nhất một label hiện ra trước khi đọc, nếu không `count()` có thể trả 0
   * khi dialog chưa render xong và test pass giả vì không có gì để so sánh.
   */
  private async getFieldReaders(): Promise<FieldReader[]> {
    await this.waitForOpen();
    await expect(this.labelCells.first()).toBeVisible();

    const labels = (await this.labelCells.allInnerTexts()).map(normalizeLabel);

    return labels
      .map((label, index): FieldReader => ({
        label,
        read: async () => {
          // Ô giá trị là td.info-text đứng ngay sau ô label trong cùng hàng
          const valueCell = this.labelCells
            .nth(index)
            .locator('xpath=following-sibling::td[contains(@class,"info-text")][1]');

          // Ô có thể đang hiện "Loading..." trong lúc chờ API
          await expect(valueCell).not.toHaveText(LOADING_TEXT);
          return (await valueCell.innerText()).trim();
        },
      }))
      .filter((field) => field.label !== ''); // Bỏ qua ô label trống (ô đệm, ô trang trí)
  }

  /**
   * Đọc thông tin trong dialog và trả về danh sách chỗ lệch so với `data` (không tự fail test).
   *
   * @param formColumnMap Map từ label trên UI (đã bỏ dấu ':' cuối) sang key của `data`
   * @param data          Dữ liệu kỳ vọng. Field nào `data` không có giá trị thì bỏ qua.
   * @param options       settleTimeout, requireAllFields (xem VerifyOptions)
   */
  async findMismatches<T extends object>(
    formColumnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
  ): Promise<FieldMismatch[]> {
    const fields = await this.getFieldReaders();
    return collectMismatches(fields, formColumnMap, data, options);
  }

  /**
   * Assert thông tin trong dialog khớp kỳ vọng. FAIL test nếu có field lệch,
   * thông báo liệt kê toàn bộ field sai. Nên dùng hàm này mặc định trong test.
   */
  async expectData<T extends object>(
    formColumnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
  ): Promise<void> {
    assertNoMismatches(await this.findMismatches(formColumnMap, data, options));
  }
}