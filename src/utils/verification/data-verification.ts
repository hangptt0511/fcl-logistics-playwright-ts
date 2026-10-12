/**
 * Các hàm thuần phục vụ việc đối chiếu dữ liệu UI:
 * tiện ích chuỗi, formatter, map cột sang key dữ liệu, tính giá trị kỳ vọng.
 * Phần đọc UI và assert nằm ở field-verifier.ts
 */

/** Text hiển thị trong ô/field khi dữ liệu đang chờ API trả về */
export const LOADING_TEXT = 'Loading...';

// -----------------------------------------------------------------------------
// Tiện ích chuỗi
// -----------------------------------------------------------------------------

/** Escape ký tự đặc biệt để đưa chuỗi vào RegExp an toàn */
export const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// -----------------------------------------------------------------------------
// Formatter
// -----------------------------------------------------------------------------

export type FormatterType = 'currency' | 'date' | 'uppercase' | 'lowercase' | 'empty-dash' | 'decimal' | 'integer';

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Dựng Date theo giờ local và kiểm tra ngày có hợp lệ không.
 * `new Date(2026, 1, 31)` tự "tràn" thành 03/03/2026 nên phải so lại từng thành phần.
 */
function buildLocalDate(y: number, m: number, d: number, hh = 0, mm = 0): Date | undefined {
    const date = new Date(y, m - 1, d, hh, mm);
    const valid = date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
    return valid ? date : undefined;
}

/**
 * Parse giá trị ngày từ nhiều dạng. Trả về undefined nếu không hợp lệ.
 *  - dd/mm/yyyy [hh:mm]
 *  - yyyy-mm-dd (dựng theo giờ local, tránh bị lệch ngày do new Date() parse theo UTC)
 *  - Date hoặc chuỗi ISO đầy đủ (dùng cơ chế parse mặc định)
 */
function parseDate(val: unknown): Date | undefined {
    if (val instanceof Date) return isNaN(val.getTime()) ? undefined : val;

    const str = String(val).trim();

    const vn = str.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}))?/);
    if (vn) {
        const [, d, m, y, hh = '0', mm = '0'] = vn;
        return buildLocalDate(+y, +m, +d, +hh, +mm);
    }

    const iso = str.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (iso) {
        const [, y, m, d] = iso;
        return buildLocalDate(+y, +m, +d);
    }

    const date = new Date(str);
    return isNaN(date.getTime()) ? undefined : date;
}

/**
 * Bộ định dạng giá trị kỳ vọng cho khớp cách UI hiển thị.
 * Formatter nhận `unknown` và ném lỗi khi dữ liệu đầu vào sai, để test fail rõ ràng
 * thay vì âm thầm đổi thành '0 VNĐ' hay '-'.
 */
export const FormatterRegistry: Record<FormatterType, (val: unknown) => string> = {
    // null/undefined hiển thị '0 VNĐ'; chuỗi không phải số thì báo lỗi (không ra 'NaN VNĐ')
    currency: (val) => {
        if (val === undefined || val === null) return '0 VNĐ';
        const num = Number(val);
        if (Number.isNaN(num)) throw new Error(`Formatter "currency": "${String(val)}" không phải số`);
        return `${num.toLocaleString('vi-VN')} VNĐ`;
    },

    // Đầu ra chỉ có dd/mm/yyyy (bỏ giờ). Nếu UI hiển thị cả giờ, cần thêm token riêng.
    // Chuỗi ISO có múi giờ (Z, +07:00) được đọc theo timezone của máy chạy test,
    // nên nên cố định `timezoneId` trong playwright.config để CI và máy local giống nhau.
    date: (val) => {
        if (val === undefined || val === null || val === '') return '-';
        const date = parseDate(val);
        if (!date) throw new Error(`Formatter "date": "${String(val)}" không phải ngày hợp lệ`);
        return `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)}/${date.getFullYear()}`;
    },

    // Dùng ?? để số 0 không bị biến thành chuỗi rỗng
    uppercase: (val) => String(val ?? '').toUpperCase(),
    lowercase: (val) => String(val ?? '').toLowerCase(),
    'empty-dash': (val) => (val !== undefined && val !== null && val !== '' ? String(val) : '-'),

    decimal: (val) => {
        if (val === undefined || val === null) return '0.00';
        const num = Number(val);
        if (Number.isNaN(num)) {
            throw new Error(`Formatter "decimal": "${String(val)}" không phải số hợp lệ`);
        }
        return num.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    },
    integer: (val) => {
        if (val === undefined || val === null) return '0';
        const num = Number(val);
        if (Number.isNaN(num)) {
            throw new Error(`Formatter "integer": "${String(val)}" không phải số hợp lệ`);
        }
        return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
    },
};

// -----------------------------------------------------------------------------
// Column map
// -----------------------------------------------------------------------------

export interface ColumnConfig<T> {
    key: keyof T;
    format?: FormatterType;
}

/**
 * Map từ label hiển thị trên UI sang key của dữ liệu.
 * Mỗi giá trị có thể là key thô hoặc { key, format }.
 *
 * Khi khai báo map nên dùng `satisfies` để bắt lỗi gõ sai key:
 *   const map = { 'Booking No': 'bookingNo' } satisfies FlexibleColumnMap<Booking>;
 */
export type FlexibleColumnMap<T> = Record<string, keyof T | ColumnConfig<T>>;

// -----------------------------------------------------------------------------
// Chuẩn hóa và tính giá trị kỳ vọng
// -----------------------------------------------------------------------------

/** Chuẩn hóa label trên UI: bỏ dấu ':' cuối và khoảng trắng thừa */
export const normalizeLabel = (text: string): string => text.replace(/:\s*$/, '').trim();

/** Chuẩn hóa giá trị đọc từ UI: mảng nối bằng ';', rồi trim */
export const normalizeActual = (value: string | string[] | null | undefined): string =>
    (Array.isArray(value) ? value.join(';') : (value ?? '')).trim();

/**
 * Tính giá trị kỳ vọng (dạng string) cho một field.
 *
 * @returns `undefined` nếu `data` không cung cấp giá trị cho field này
 *          (nghĩa là bỏ qua, không kiểm tra). Việc kiểm tra này được làm TRƯỚC khi format,
 *          nếu không các formatter sẽ biến `undefined` thành '0 VNĐ' hay '-' và vẫn bị so sánh.
 *          Muốn assert field trống, truyền `null` hoặc `''` trong data.
 */
export function resolveExpected<T extends object>(
    config: keyof T | ColumnConfig<T>,
    data: Partial<T>,
): string | undefined {
    const isObjectConfig = typeof config === 'object' && config !== null;
    const key = (isObjectConfig ? config.key : config) as keyof T;
    const format = isObjectConfig ? config.format : undefined;

    const raw = data[key];
    if (raw === undefined) return undefined;

    if (format) return FormatterRegistry[format](raw).trim();
    if (raw === null) return '';
    return String(Array.isArray(raw) ? raw.join(';') : raw).trim();
}