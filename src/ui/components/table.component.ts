import { Page, Locator, expect, test } from '@playwright/test';
import { escapeRegExp, LOADING_TEXT } from '@utils/verification/data-verification';

/**
 * Map các action có icon hiển thị trực tiếp trên hàng (không nằm trong menu "more").
 * Key là title của action, value là selector icon tương ứng.
 * Thêm action mới chỉ cần thêm một dòng vào đây, không phải sửa logic trong hàm.
 */
const ICON_ACTIONS: Record<string, string> = {
  Detail: 'i.icon-list',
  Select: 'i.icon-arrow-down-circle',
};

/**
 * Component Object đại diện cho bảng dữ liệu dùng chung trong hệ thống.
 */
export class TableComponent {
  /** Các ô tiêu đề cột đang hiển thị */
  readonly headers: Locator;
  /** Tất cả hàng dữ liệu trong tbody */
  readonly rows: Locator;
  /** Hàng chứa ô lọc dữ liệu theo từng cột */
  readonly filterRow: Locator;
  /** Tất cả ô dữ liệu đang hiển thị của mọi hàng */
  readonly cells: Locator;
  readonly page: Page;
  /** Nút reset bộ lọc, nằm trong filter row */
  protected resetButton: Locator;
  /** Phần text được highlight khi tìm kiếm */
  readonly searchHighlight: Locator;
  /** Hàng hiển thị ảnh "No Data" khi bảng không có dữ liệu */
  readonly noDataRow: Locator;
  /** Ảnh loading của toàn trang (loader dùng chung, không nằm trong bảng) */
  readonly loaderImg: Locator;

  constructor(container: Locator) {
    this.headers = container.locator('thead th:visible');
    this.rows = container.locator('tbody tr');
    this.filterRow = container.locator('tr.filter-row');
    this.cells = this.rows.locator('td:visible');
    this.page = container.page();
    this.resetButton = this.filterRow.locator('td.actions a:has(i.icon-refresh-cw)');
    this.searchHighlight = container.locator('tbody span.search-highlight');
    // Lưu ý: title của ảnh có dấu cách đầu " No Data", khớp với DOM hiện tại.
    // Nếu dev sửa title, selector này sẽ gãy.
    this.noDataRow = container.locator('tbody tr:has(img[title=" No Data"])');
    this.loaderImg = this.page.locator('#loader').getByRole('img');
  }

  // ---------------------------------------------------------------------------
  // Chờ trạng thái
  // ---------------------------------------------------------------------------

  /**
   * Chờ loader của trang biến mất.
   */
  async waitForLoaded(): Promise<void> {
    await expect(this.loaderImg).toBeHidden();
  }

  // ---------------------------------------------------------------------------
  // Lấy hàng
  // ---------------------------------------------------------------------------

  /**
   * Lấy Locator của hàng dữ liệu đầu tiên.
   */
  getFirstRow(): Locator {
    return this.rows.first();
  }

  /**
   * Tìm các hàng theo giá trị của một cột.
   * @param columnName Tên cột hiển thị trên header
   * @param value      Giá trị cần tìm
   * @param exact      true (mặc định): khớp chính xác toàn bộ ô; false: chỉ cần chứa text
   * @returns Locator có thể match 0, 1 hoặc nhiều hàng
   */
  async getRowsByColumnValue(
    columnName: string,
    value: string | number,
    { exact = true }: { exact?: boolean } = {},
  ): Promise<Locator> {
    const col = await this.getColumnIndex(columnName);
    const text = String(value).trim();

    // Khi khớp chính xác: escape ký tự đặc biệt rồi bao bằng ^\s*...\s*$
    // để bỏ qua khoảng trắng thừa hai đầu nhưng không khớp nhầm chuỗi dài hơn.
    const hasText = exact
      ? new RegExp(`^\\s*${escapeRegExp(text)}\\s*$`)
      : text;

    return this.rows.filter({
      has: this.page.locator('td:visible').nth(col).filter({ hasText }),
    });
  }

  /**
   * Tìm hàng đầu tiên khớp giá trị.
   */
  async getRowByColumnValue(
    columnName: string,
    value: string | number,
    options?: { exact?: boolean },
  ): Promise<Locator> {
    return (await this.getRowsByColumnValue(columnName, value, options)).first();
  }

  /**
   * Lấy số lượng hàng dữ liệu thực tế đang hiển thị.
   * Trả về 0 khi bảng hiện "No Data" (hàng No Data không tính là dữ liệu).
   */
  async getRowCount(): Promise<number> {
    return await test.step('Lấy số lượng dòng đang hiển thị', async () => {
      // Phải chờ loader ẩn trước, nếu không có thể đếm nhầm dữ liệu cũ
      // hoặc đọc khi hàng No Data chưa kịp render.
      await this.waitForLoaded();
      return (await this.noDataRow.isVisible()) ? 0 : await this.rows.count();
    });
  }

  // ---------------------------------------------------------------------------
  // Cột và ô
  // ---------------------------------------------------------------------------

  /**
   * Lấy toàn bộ tên cột đang hiển thị (đã trim), theo đúng thứ tự trên UI.
   * Chờ header đầu tiên xuất hiện để tránh đọc khi bảng chưa vẽ xong.
   */
  async getHeaderTexts(): Promise<string[]> {
    await this.headers.first().waitFor();
    return (await this.headers.allInnerTexts()).map(t => t.trim());
  }

  /**
   * Lấy tên hiển thị của cột theo index (tính trên các cột đang hiển thị).
   */
  async getColumnName(visibleColIndex: number): Promise<string> {
    return (await this.headers.nth(visibleColIndex).innerText())?.trim() ?? '';
  }

  /**
   * Tìm index của cột theo tên hiển thị trên header.
   * @throws Error kèm danh sách cột hiện có nếu không tìm thấy, giúp debug nhanh.
   */
  async getColumnIndex(columnName: string): Promise<number> {
    const names = await this.getHeaderTexts();
    const index = names.indexOf(columnName.trim());
    if (index === -1) {
      throw new Error(`Không tìm thấy cột "${columnName}". Các cột hiện có: ${names.join(' | ')}`);
    }
    return index;
  }

  /** Lấy Locator của ô theo hàng và index cột (chỉ tính các ô đang hiển thị) */
  protected cellOf(row: Locator, col: number): Locator {
    return row.locator('td:visible').nth(col);
  }

  /**
   * Nơi DUY NHẤT đọc text của một ô. Mọi hàm khác phải gọi lại hàm này
   * để logic không bị lệch giữa nhiều nơi.
   *
   * Xử lý:
   *  - Chờ ô hết "Loading..." (ô có thể đang chờ API).
   *  - Ô chứa switch không có text, nên quy đổi theo aria-checked.
   */
  async getCellTextByIndex(row: Locator, col: number): Promise<string> {
    const cell = this.cellOf(row, col);

    await expect(cell).not.toHaveText(LOADING_TEXT);

    const toggle = cell.locator('button[role="switch"]');
    if ((await toggle.count()) > 0) {
      // Giá trị 'Active' / 'Inactive' đang gắn với nghiệp vụ hiện tại.
      // Nếu component dùng cho màn hình khác, nên đưa vào config.
      return (await toggle.getAttribute('aria-checked')) === 'true' ? 'Active' : 'Inactive';
    }

    return (await cell.innerText()).trim();
  }

  /**
   * Lấy giá trị hiển thị của một ô theo hàng và tên cột.
   * @param row         Locator của hàng (từ getRowByColumnValue, getFirstRow, rows.nth(i)...)
   * @param columnName  Tên cột hiển thị trên header
   */
  async getCellText(row: Locator, columnName: string): Promise<string> {
    return this.getCellTextByIndex(row, await this.getColumnIndex(columnName));
  }

  // ---------------------------------------------------------------------------
  // Hành động
  // ---------------------------------------------------------------------------

  /**
   * Click một hành động trong hàng.
   *
   * - Action có icon riêng (khai báo trong ICON_ACTIONS): click thẳng icon.
   * - Các action còn lại: hover vào menu "more" để hiện nút rồi click theo title.
   *
   * @param row                  Locator của hàng dữ liệu
   * @param actionTitle          Attribute title của nút hành động (hoặc key trong ICON_ACTIONS)
   * @param waitForNetworkCallback Callback chờ API (ví dụ `() => page.waitForResponse(...)`).
   *                             Truyền vào nếu action có trigger API, áp dụng cho CẢ HAI nhánh.
   */
  async clickActionInRow(
    row: Locator,
    actionTitle: string,
    waitForNetworkCallback?: () => Promise<unknown>,
  ): Promise<void> {
    const iconSelector = ICON_ACTIONS[actionTitle];
    let target: Locator;

    if (iconSelector) {
      target = row.locator(iconSelector);
    } else {
      // Phải hover thì nút hành động mới hiển thị
      await row.locator('i.icon-more-horizontal').click();
      target = row.locator(`a[title="${actionTitle}"]`);
    }

    if (waitForNetworkCallback) {
      // Đăng ký chờ response TRƯỚC khi click để không bỏ lỡ response đến sớm
      await Promise.all([waitForNetworkCallback(), target.click()]);
    } else {
      await target.click();
    }
  }
}