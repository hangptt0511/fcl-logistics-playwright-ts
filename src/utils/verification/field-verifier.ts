import { expect } from '@playwright/test';
import { FlexibleColumnMap, resolveExpected } from './data-verification';

/** Một field trên UI: tên hiển thị và cách đọc giá trị hiện tại */
export interface FieldReader {
  label: string;
  read(): Promise<string>;
}

/** Một chỗ lệch giữa kỳ vọng và thực tế */
export interface FieldMismatch {
  column: string;
  expected: string;
  actual: string;
}

export interface VerifyOptions {
  /**
   * Thời gian (ms) chờ giá trị ổn định khi thấy lệch, phòng trường hợp field điền trễ
   * (dialog Edit nạp dữ liệu từ API). 0 để tắt. Mỗi field lệch tốn tối đa chừng này thời gian.
   */
  settleTimeout?: number;
  /**
   * true (mặc định): field có trong columnMap và có dữ liệu kỳ vọng nhưng KHÔNG thấy trên UI
   * thì báo lỗi. Đặt false nếu dùng chung một map cho nhiều màn hình có số field khác nhau.
   */
  requireAllFields?: boolean;
}

export const NOT_FOUND_ON_UI = '(không tìm thấy trên UI)';

const hasOwn = (obj: object, key: string) => Object.prototype.hasOwnProperty.call(obj, key);

/**
 * Lõi so sánh dùng chung: duyệt các field trên UI, đối chiếu với `data` theo `columnMap`.
 * Không tự fail test, trả về danh sách chỗ lệch để phía gọi quyết định.
 */
export async function collectMismatches<T extends object>(
  fields: FieldReader[],
  columnMap: FlexibleColumnMap<T>,
  data: Partial<T>,
  { settleTimeout = 2000, requireAllFields = true }: VerifyOptions = {},
): Promise<FieldMismatch[]> {
  const mismatches: FieldMismatch[] = [];
  const seenLabels = new Set<string>();

  for (const field of fields) {
    if (!hasOwn(columnMap, field.label)) continue;
    seenLabels.add(field.label);

    const expected = resolveExpected(columnMap[field.label], data);
    if (expected === undefined) continue; // data không có giá trị cho field này

    let actual = await field.read();

    if (actual !== expected && settleTimeout > 0) {
      // Thử chờ giá trị ổn định rồi đọc lại; hết giờ thì bỏ qua, lát nữa so sánh lần cuối
      await expect
        .poll(() => field.read(), { timeout: settleTimeout })
        .toBe(expected)
        .catch(() => undefined);
      actual = await field.read();
    }

    if (actual !== expected) {
      mismatches.push({ column: field.label, expected, actual });
    }
  }

  // Chiều ngược lại: có dữ liệu kỳ vọng nhưng UI không có field đó
  // (label bị đổi tên hoặc field biến mất). Nếu không kiểm tra, test sẽ pass giả.
  if (requireAllFields) {
    for (const [label, config] of Object.entries(columnMap)) {
      if (seenLabels.has(label)) continue;
      const expected = resolveExpected(config, data);
      if (expected !== undefined) {
        mismatches.push({ column: label, expected, actual: NOT_FOUND_ON_UI });
      }
    }
  }

  return mismatches;
}

/** Tạo thông báo lỗi dễ đọc cho danh sách chỗ lệch */
export function formatMismatches(mismatches: FieldMismatch[]): string {
  if (mismatches.length === 0) return 'Dữ liệu khớp kỳ vọng';
  const lines = mismatches.map(
    m => `  - [${m.column}] kỳ vọng "${m.expected}" nhưng thực tế "${m.actual}"`,
  );
  return `Có ${mismatches.length} field hiển thị sai dữ liệu:\n${lines.join('\n')}`;
}

/** Fail test nếu còn chỗ lệch, thông báo liệt kê toàn bộ field sai */
export function assertNoMismatches(mismatches: FieldMismatch[]): void {
  expect.soft(mismatches, formatMismatches(mismatches)).toEqual([]);
}