import { FlexibleColumnMap, normalizeActual, normalizeLabel } from './data-verification';
import {
    FieldMismatch,
    FieldReader,
    VerifyOptions,
    assertNoMismatches,
    collectMismatches,
} from './field-verifier';

/** Một field của form chỉnh sửa (input, select, checkbox...) */
export interface FormField {
    getName(): Promise<string>;
    getValue(): Promise<string | string[]>;
    getErrorMessage(): Promise<string>;
}

/**
 * Đọc các field của form và trả về danh sách chỗ lệch so với `data` (không tự fail test).
 * Không biết form nằm trong dialog hay trang riêng; nơi gọi tự chờ form sẵn sàng trước.
 *
 * @param fields        Các field của form cần kiểm tra
 * @param formColumnMap Map từ tên field trên UI sang key của `data`
 * @param data          Dữ liệu kỳ vọng. Field nào `data` không có giá trị thì bỏ qua.
 */
export async function findFormMismatches<T extends object>(
    fields: FormField[],
    formColumnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
): Promise<FieldMismatch[]> {
    // Lấy tên field một lần; giá trị chỉ đọc khi cần so sánh (và đọc lại khi chờ ổn định)
    const readers: FieldReader[] = await Promise.all(
        fields.map(async (field) => ({
            label: normalizeLabel(await field.getName()),
            read: async () => normalizeActual(await field.getValue()),
        })),
    );

    return collectMismatches(readers, formColumnMap, data, options);
}

/** Assert dữ liệu trong form khớp kỳ vọng; FAIL nếu có field lệch, liệt kê toàn bộ field sai. */
export async function expectFormData<T extends object>(
    fields: FormField[],
    formColumnMap: FlexibleColumnMap<T>,
    data: Partial<T>,
    options?: VerifyOptions,
): Promise<void> {
    assertNoMismatches(await findFormMismatches(fields, formColumnMap, data, options));
}