/**
 * Chuẩn hoá query params cho request HTTP:
 * - Bỏ qua giá trị null/undefined
 * - Ép object/array phức tạp thành chuỗi JSON (vì query string chỉ nhận string/number/boolean)
 * - Trả về undefined nếu không còn param nào hợp lệ, để Playwright không gửi params rỗng
 */
export function normalizeQueryParams(
  params?: Record<string, unknown>
): Record<string, string | number | boolean> | undefined {
  if (!params) return undefined;

  const normalized: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;

    normalized[key] = typeof value === 'object'
      ? JSON.stringify(value)
      : (value as string | number | boolean);
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}