import { Locator } from '@playwright/test';

export class BaseComponent {
    readonly formGroup: Locator;
    public readonly errorLabel: Locator;

    constructor(root: Locator, formGroup?: Locator) {
        this.formGroup = formGroup
            ?? root.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]');
        this.errorLabel = this.formGroup.locator('small.text-danger');
    }

    /**
     * Lấy tên nhãn (Label Name) của trường dữ liệu hiện tại trong form.
     * Hàm được thiết kế để xử lý linh hoạt các biến thể DOM không đồng nhất trong ứng dụng 
     * (hỗ trợ cả trường hợp text nằm trực tiếp trong <label> hoặc được bọc bên trong thẻ <span>),
     * đồng thời tự động loại bỏ các ký hiệu phụ như dấu sao bắt buộc '(*)' hoặc '*' để trả về tên nhãn chuẩn xác.
     * 
     * @returns {Promise<string>} Trả về tên nhãn đã được làm sạch, hoặc 'Unknown Field' nếu không tìm thấy.
     */
    async getName(): Promise<string> {
        const labelEl = this.formGroup.locator('label.form-label');

        // Kiểm tra an toàn (Guard clause): Nếu không tìm thấy label, tránh gây timeout hoặc crash test
        if (await labelEl.count() === 0) {
            return 'Unknown Field';
        }

        // Sử dụng innerText() thay vì textContent():
        // - innerText() lấy đúng văn bản thực tế hiển thị trên giao diện.
        // - Tự động xử lý gom text từ cả thẻ label lẫn các thẻ con (span) mà không bị phụ thuộc cấu trúc cứng.
        let labelText = await labelEl.innerText();

        if (!labelText) return 'Unknown Field';

        // Dùng Regex để loại bỏ ký hiệu trường bắt buộc '(*)' hoặc '*' và cắt bỏ khoảng trắng thừa
        labelText = labelText.replace(/\(\*\)/g, '').replace(/\*/g, '') .trim();

        return labelText || 'Unknown Field';
    }

    async getErrorMessage(): Promise<string> {
        if ((await this.errorLabel.count()) === 0) return '';
        return (await this.errorLabel.first().innerText()).trim();
    }
}