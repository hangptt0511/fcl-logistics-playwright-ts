import { DateUtil, Weekday } from '@utils/data/date.util';

// ═══════════════ Sinh id cho bộ test case ═══════════════

/** Sinh id theo thứ tự (PREFIX_01, PREFIX_02...), báo lỗi nếu trùng. Dùng cho mọi bộ case data-driven. */
export const withIds = <T extends { id: string }>(prefix: string, cases: Omit<T, 'id'>[]): T[] => {
    const result = cases.map((c, i) => ({ ...c, id: `${prefix}_${String(i + 1).padStart(2, '0')}` }) as T);
    const ids = result.map((c) => c.id);
    if (new Set(ids).size !== ids.length) throw new Error(`Trùng id test case (${prefix})`);
    return result;
};

// ═══════════════ Ghi chú duy nhất để nhận diện bản ghi vừa tạo ═══════════════

/** Sinh note duy nhất: <yyyyMMdd>-<HHmmss>-<4 ký tự ngẫu nhiên> */
export const uniqueNote = (): string => {
    const d = new Date();
    const p = (n: number) => String(n).padStart(2, '0');
    const date = `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}`;
    const time = `${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
    const rand = Math.random().toString(36).slice(2, 6);
    return `${date}-${time}-${rand}`;
};

/** Gắn note duy nhất vào remark, giữ nội dung remark có sẵn (nếu có) ở phía trước */
export const withUniqueNote = <T extends { remark?: string }>(data: T): T => ({
    ...data,
    remark: [data.remark, uniqueNote()].filter(Boolean).join(' | '),
});

// ═══════════════ Dữ liệu nền + ghi đè ═══════════════

/**
 * Tạo hàm "dữ liệu nền hợp lệ + ghi đè", để mỗi case chỉ có MỘT nguyên nhân lỗi.
 * const valid = makeValid(BASE_MANDATORY);  valid({ quantity: -1 })
 */
export const makeValid =
    <T extends object>(base: T) =>
        (overrides: Partial<T>): T => ({ ...base, ...overrides });

// ═══════════════ Ngày tháng theo định dạng của ứng dụng ═══════════════

export const getCurrentDate = (): string => DateUtil.getCurrentDate(DateUtil.FORMAT_APP);
export const getCurrentDatetime = (): string => DateUtil.getCurrentDate(DateUtil.FORMAT_DATETIME_APP);
export const getRelativeDate = (n: number): string => DateUtil.getRelativeDate(n, DateUtil.FORMAT_APP);
export const getRelativeDatetime = (n: number): string => DateUtil.getRelativeDate(n, DateUtil.FORMAT_DATETIME_APP);
export const getDateByWeekday = (w: Weekday): string => DateUtil.getDateByWeekday(w, { format: DateUtil.FORMAT_APP });