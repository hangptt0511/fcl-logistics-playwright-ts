import { expect, Locator } from '@playwright/test';
import { BaseComponent } from './base.component';

export class NgxInputComponent extends BaseComponent {
    readonly input: Locator;
    readonly clearAllSpan: Locator;

    constructor(readonly root: Locator) {
        super(root, root.locator('..').locator('..'))
        // Đi ngược từ root lên thẻ div bọc cả .form-group và ngx-validator
        //Cách tạm thời: Cấu trúc HTML bị lệch ngx-validator có thể nằm trong hoặc ngoài .form-group, 
        //dev code không thống nhất nhờ dev fix cho đồng bộ

        //this.formGroup = root.page().locator('.form-group').filter({ has: root });
        this.input = root.locator('input');
        this.clearAllSpan = root.locator("span.reset-icon")
    }

    /**
     * Nhập giá trị
     * @param value Giá trị ô input
     */
    async fill(value?: string) {
        if (value !== undefined) {
            if (value === "") {
                if (await this.clearAllSpan.isVisible())
                    await this.clearAllSpan.click();
                else await this.input.fill('');
            }
            else {
                await this.input.pressSequentially(value);
                await this.input.click();
            }
        }
    }

    /**
     * Nhập giá trị vào ô input tiền/số (ngx-input-money).
     * Component tự format, gõ quá nhanh sẽ làm con trỏ nhảy vị trí và sai giá trị
     * @param value Giá trị ô input
     */
    async fillMoney(value?: string) {
        if (value !== undefined) {
            if (value === "") {
                if (await this.clearAllSpan.isVisible())
                    await this.clearAllSpan.click();
                else await this.input.fill('');
            }
            else {
                // Phần đầu: fill một lần, tránh lỗi con trỏ nhảy vị trí
                await this.input.fill(value.slice(0, -1));
                // Ký tự cuối: gõ thật để phát sinh đủ keydown, input, keyup
                await this.input.pressSequentially(value.slice(-1));
            }
        }
    }

    /**
     * Lấy giá trị
     * @returns 
     */
    async getValue(): Promise<string> {
        // Chờ ô input hiển thị trên UI trước khi lấy giá trị
        await this.input.waitFor({ state: 'attached' });
        return await this.input.inputValue();
    }

    /**
    * Xóa sạch dữ liệu đang chọn
    */
    async clearAll() {
        await this.clearAllSpan.click();
    }

    /**
 * Chọn ngày giờ qua popup xdsoft DateTimePicker
 * @param value Định dạng "dd/MM/yyyy HH:mm" hoặc "dd/MM/yyyy" (chỉ chọn ngày). "" để xóa
 */
    async fillDateTime(value?: string) {
        if (value === undefined) return;

        if (value === "") {
            if (await this.clearAllSpan.isVisible())
                await this.clearAllSpan.click();
            else await this.input.fill('');
            return;
        }

        // Tách thành ngày, tháng, năm, giờ, phút
        const [datePart, timePart] = value.trim().split(/\s+/);
        const [day, month, year] = datePart.split('/').map(Number);
        const [hour, minute] = timePart ? timePart.split(':').map(Number) : [undefined, undefined];

        await this.input.click(); // mở popup
        const popup = this.root.page().locator('.xdsoft_datetimepicker:visible').last();

        // Chờ lưới ngày render xong rồi mới điều hướng
        await popup.locator('td.xdsoft_date').first().waitFor({ state: 'visible' });

        const target = year * 12 + (month - 1);
        const dayCell = popup.locator(
            `td.xdsoft_date[data-date="${day}"][data-month="${month - 1}"][data-year="${year}"]`
        );
        const monthPicker = popup.locator('.xdsoft_datepicker .xdsoft_monthpicker');

        for (let i = 0; i < 24 && (await dayCell.count()) === 0; i++) {
            const anyCell = popup.locator('td.xdsoft_date:not(.xdsoft_other_month)').first();
            const currentMonth = Number(await anyCell.getAttribute('data-month'));
            const currentYear = Number(await anyCell.getAttribute('data-year'));
            const current = currentYear * 12 + currentMonth;
            await monthPicker.locator(current < target ? '.xdsoft_next' : '.xdsoft_prev').click();
        }
        await dayCell.click();

        // Chọn giờ nếu có (data-hour, data-minute không có số 0 đứng đầu)
        if (hour !== undefined && minute !== undefined) {
            await popup
                .locator(`.xdsoft_time[data-hour="${hour}"][data-minute="${minute}"]`)
                .click();
        }
    }
}

export class InputComponent extends NgxInputComponent {
    readonly input: Locator;
    constructor(root: Locator) {
        super(root)
        this.input = root;
    }
}