import type { InputComponent } from '@ui/components/input.component';
import type { ComboboxComponent } from '@ui/components/combobox.component';

/** Chỉ cần Component có method này, nên hàm không phụ thuộc cứng vào class cụ thể */
type FillableInput = Pick<InputComponent, 'getValue' | 'fill'>;
type FillableCombobox = Pick<ComboboxComponent, 'getSelectedValues' | 'clearAll' | 'selectByFilter' | 'getSingleValue'>;

/**
 * Giá trị truyền cho tham số thứ hai của `selectByFilter` (giữ nguyên như code gốc).
 * Hãy đổi tên hằng số này theo đúng ý nghĩa của tham số trong ComboboxComponent.
 */
const COMBOBOX_SELECT_ARG = 1;

/**
 * Số theo định dạng UI tiếng Anh: dấu ',' ngăn cách hàng nghìn, dấu '.' là thập phân.
 * Chấp nhận: "1234", "1,234", "1,234,567.89", "-12.5", "0.5".
 * Từ chối: "1.234.567" (kiểu Việt Nam), "12,34" (nhóm sai), "1,23,456", "abc", "".
 */
const EN_NUMBER_PATTERN = /^-?(\d+|\d{1,3}(,\d{3})+)(\.\d+)?$/;

/**
 * Chuyển text số trên UI (định dạng tiếng Anh) thành number.
 *
 * Kiểm tra chặt định dạng thay vì xóa bừa dấu ',' và khoảng trắng, vì cách đó
 * có thể ra số sai mà không báo lỗi (ví dụ "1,5" thành 15).
 *
 * @throws Error nếu ô trống hoặc không đúng định dạng số tiếng Anh
 */
export function parseNumber(raw: string): number {
    const text = raw.trim();
    if (text === '') throw new Error('Ô số đang trống, không chuyển được thành number');
    if (!EN_NUMBER_PATTERN.test(text)) {
        throw new Error(`"${raw}" không đúng định dạng số (kỳ vọng dạng 1,234,567.89)`);
    }
    return Number(text.replace(/,/g, ''));
}

/**
 * Điền giá trị vào ô nhập, hoặc đọc giá trị mặc định đang có trên UI.
 *
 * - `value` là undefined: không điền, đọc giá trị hiện có trên UI.
 *   Mặc định trả string; truyền `as: 'number'` để nhận number.
 * - `value` có giá trị: điền vào ô và trả lại đúng giá trị đó, cùng kiểu.
 *
 * Dùng để một test chạy được cả khi truyền dữ liệu riêng lẫn khi dùng dữ liệu mặc định của form.
 */
export async function fillOrGetInput(input: FillableInput, value?: string): Promise<string>;
export async function fillOrGetInput(input: FillableInput, value: number): Promise<number>;
export async function fillOrGetInput(input: FillableInput, value: number | undefined, as: 'number'): Promise<number>;
export async function fillOrGetInput(
    input: FillableInput,
    value?: string | number,
    as?: 'number',
): Promise<string | number> {
    if (value === undefined) {
        const raw = await input.getValue();
        return as === 'number' ? parseNumber(raw) : raw;
    }
    await input.fill(String(value));
    return value;
}

/**
 * Chọn giá trị cho combobox, hoặc đọc các giá trị đang được chọn trên UI.
 *
 * - `value` là undefined: không đổi gì, trả về các giá trị đang chọn.
 * - `value` có giá trị: XÓA HẾT lựa chọn hiện có, rồi chọn lại đúng các giá trị này
 *   (không cộng dồn với lựa chọn mặc định). Trả lại đúng `value`.
 */
export async function fillOrGetMultiCombobox(cbb: FillableCombobox, value?: string[]): Promise<string[]> {
    if (value === undefined) return cbb.getSelectedValues();

    await cbb.clearAll();
    await cbb.selectByFilter(value, COMBOBOX_SELECT_ARG);
    return value;
}

export async function fillOrGetSingleCombobox(cbb: FillableCombobox, value?: string): Promise<string> {
    if (value === undefined) return cbb.getSingleValue();

    await cbb.clearAll();
    await cbb.selectByFilter(value, COMBOBOX_SELECT_ARG);
    return value;
}