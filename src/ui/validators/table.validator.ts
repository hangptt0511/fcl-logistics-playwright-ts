import { Locator } from '@playwright/test';
import { FlexibleColumnMap } from '@utils/verification/data-verification';
import {
  FieldMismatch,
  FieldReader,
  VerifyOptions,
  assertNoMismatches,
  collectMismatches,
} from '@utils/verification/field-verifier';
import { TableComponent } from '../components/table.component';

export type CellMismatch = FieldMismatch;

/**
 * Các hàm kiểm tra dữ liệu cho bảng
 */
export class TableValidator {
  constructor(private readonly table: TableComponent) {}

  /**
   * Đọc dữ liệu một hàng và trả về danh sách chỗ lệch so với `data` (không tự fail test).
   * Dùng khi muốn tự xử lý kết quả, ví dụ gom lỗi nhiều hàng rồi báo cáo một lần.
   * Nếu chỉ cần assert, dùng expectRowData để khỏi quên kiểm tra kết quả.
   *
   * @param row       Locator của hàng cần kiểm tra
   * @param columnMap Map từ tên cột trên UI sang key của `data`
   *                  ('Tên cột': 'key' hoặc 'Tên cột': { key, format })
   * @param data      Dữ liệu kỳ vọng. Cột nào `data` không có giá trị thì bỏ qua.
   * @param options   settleTimeout, requireAllFields (xem VerifyOptions).
   *                  Lưu ý requireAllFields mặc định true: cột có trong map và có dữ liệu
   *                  nhưng không hiển thị trên bảng (đổi tên, bị ẩn) sẽ bị báo lỗi.
   *                  Đặt false nếu dùng chung một map cho nhiều bảng có cột khác nhau.
   */
  async findRowMismatches<T extends object>(
    row: Locator,
    columnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
  ): Promise<FieldMismatch[]> {
    await this.table.waitForLoaded();

    // Lấy header một lần; mỗi cột đọc theo index khi cần so sánh
    const headerTexts = await this.table.getHeaderTexts();
    const fields: FieldReader[] = headerTexts.map((label, index) => ({
      label,
      read: () => this.table.getCellTextByIndex(row, index),
    }));

    return collectMismatches(fields, columnMap, data, options);
  }

  /**
   * Assert dữ liệu của một hàng khớp với kỳ vọng. Fail test nếu có chỗ lệch,
   * thông báo lỗi liệt kê toàn bộ cột sai (không dừng ở lỗi đầu tiên).
   *
   * Đây là hàm nên dùng mặc định trong test.
   */
  async expectRowData<T extends object>(
    row: Locator,
    columnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
  ): Promise<void> {
    assertNoMismatches(await this.findRowMismatches(row, columnMap, data, options));
  }
}