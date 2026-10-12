/**
 * Loại bỏ một field khỏi object, dùng để test case "thiếu field bắt buộc".
 */
export function omitField<T extends object, K extends keyof T>(
    obj: T,
    key: K
): Omit<T, K> {
    const { [key]: _, ...rest } = obj;
    return rest;
}

/**
 * Loại bỏ nhiều field cùng lúc.
 */
export function omitFields<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
): Omit<T, K> {
    const result = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
}

/**
 * Loại bỏ một field lồng bên trong object con của payload,
 * dùng để test case "thiếu field bắt buộc nằm trong nested object"
 * (vd: payload.master.code, payload.address.province...).
 *
 * Không thay đổi object gốc - trả về bản copy mới, chỉ nested object
 * chứa field bị xoá được tạo mới, các phần khác của payload giữ nguyên tham chiếu.
 */
export function omitNestedField<
    T extends object,
    NK extends keyof T,
    K extends keyof T[NK]
>(
    obj: T,
    nestedKey: NK,
    key: K
): T {
    const nestedObj = obj[nestedKey] as object;
    const { [key]: _, ...restNested } = nestedObj as any;

    return {
        ...obj,
        [nestedKey]: restNested,
    };
}