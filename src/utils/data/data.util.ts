/**
 * Kiểm tra data có đủ các key bắt buộc (khác undefined).
 * Trả về data với kiểu đã thu hẹp: các key này chắc chắn có giá trị.
 */
export function ensureHas<T extends object, K extends keyof T>(
    data: T,
    keys: readonly K[],
    source: string,
): T & Required<Pick<T, K>> {
    const missing = keys.filter((k) => data[k] === undefined);
    if (missing.length > 0) {
        throw new Error(`[${source}] Data thiếu field: ${missing.map(String).join(', ')}`);
    }
    return data as T & Required<Pick<T, K>>;
}