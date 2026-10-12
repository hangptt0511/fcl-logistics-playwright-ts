import { Locator } from '@playwright/test';
import { logger } from "@utils/logger";
import { BaseComponent } from './base.component';

// Khai báo kiểu dữ liệu cho bộ lọc theo cột
export interface ColumnFilter {
    index: number; // Vị trí cột (bắt đầu từ 0 cho cột Id, 1 cho cột Name...)
    value: string;       // Giá trị cần gõ vào ô filter của cột đó
}

/**
 * Hiển thị dạng danh sách, tìm kiếm dữ liệu, chọn 1 hoặc nhiều giá trị
 */
export class ComboboxComponent extends BaseComponent {
    protected container: Locator;
    protected ngSelect: Locator;
    protected dropdownPanel: Locator;
    protected searchInput: Locator;
    protected clearAllSpan: Locator;
    protected filterInputs: Locator;
    readonly formGroup: Locator;
    readonly noDataRow: Locator;

    constructor(root: Locator) {
        super(root, root.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]'));
        this.formGroup = root.locator('xpath=ancestor::*[contains(concat(" ", normalize-space(@class), " "), " form-group ")][1]');
        this.container = root.locator('.ng-select-container');
        this.ngSelect = root.locator('ng-select');
        this.dropdownPanel = root.page().locator('ng-dropdown-panel')
        this.searchInput = this.dropdownPanel.locator('#txtSearchColumn');
        this.clearAllSpan = this.container.locator("span[title='Clear all']");
        this.filterInputs = this.dropdownPanel.locator("tr.filter-row input");
        this.noDataRow = this.dropdownPanel.locator('.ng-option.ng-option-disabled', { hasText: 'No items found' });

    }

    /**
     * Lấy danh sách giá trị đang chọn (0, 1 hoặc nhiều).
     * Subclass có cấu trúc DOM khác (vd: NgxCustomSearchMulti) override lại.
     */
    async getSelectedValues(): Promise<string[]> {
        const values = await this.container.locator('.ng-value span').allInnerTexts();
        return values.map(v => v.trim()).filter(v => v.length > 0);
    }

    async getValue(): Promise<string[]> {
        return this.getSelectedValues();
    }

    async getSingleValue(): Promise<string> {
        return (await this.getSelectedValues())[0] ?? '';
    }

    protected get optionRows(): Locator {
        return this.dropdownPanel.locator('.ng-option');
    }

    protected async waitForSearchResult(text: string): Promise<Locator> {
        const optionRow = this.optionRows.filter({ hasText: text }).first();
        await optionRow.or(this.noDataRow).waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });

        const fieldName = await this.getName();

        if (!(await optionRow.isVisible())) {
            const availableOptions = await this.dropdownPanel.locator('.ng-option').allInnerTexts();
            logger.error('Không tìm thấy option trong combobox', {
                field: fieldName,
                expectedOption: text,
                availableOptions: availableOptions.map((o) => o.trim()),
                isNoDataShown: await this.noDataRow.isVisible(),
            });
            throw new Error(
                `[ComboboxComponent]: Không tìm thấy option "${text}" trong trường "${fieldName}"`
            );
        }
        return optionRow;
    }

    /**
 * Tích chọn 1 hoặc nhiều. Áp dụng cho danh sách không có thanh cuộn (<=6 dòng)
 * @param option Text của option cần chọn
 */
    async select(option: string[] | string) {
        const optionsArray = typeof option === 'string' ? [option] : option;
        if (optionsArray.length === 0) return;

        const fieldName = await this.getName();

        // Mở combobox
        await this.container.click();

        for (const optionText of optionsArray) {
            const optionRow = this.dropdownPanel.locator('.ng-option', { hasText: optionText }).first();

            if (!(await optionRow.isVisible())) {
                const availableOptions = await this.dropdownPanel.locator('.ng-option').allInnerTexts();
                logger.error('Không tìm thấy option trong combobox', {
                    field: fieldName,
                    expectedOption: optionText,
                    availableOptions: availableOptions.map((o) => o.trim()),
                    isNoDataShown: await this.noDataRow.isVisible(),
                });

                throw new Error(
                    `[ComboboxComponent]: Không tìm thấy option "${optionText}" trong trường "${fieldName}"`
                );
            }

            logger.debug('Chọn option trong combobox', { field: fieldName, option: optionText });
            await optionRow.click();
        }
    }

    /**
     * Tìm kiếm và chọn 1 hoặc nhiều
     * @param value Từ khóa nhập vào ô Search
     */
    async searchAndSelect(option: string[] | string) {
        const optionsArray = typeof option === 'string' ? [option] : option;
        if (optionsArray.length === 0) return;

        const fieldName = await this.getName();

        // Mở combobox
        await this.container.click();

        for (const optionText of optionsArray) {
            // Nhập từ khóa
            await this.searchInput.fill(optionText);

            //Chờ cho đến khi có dòng dữ liệu hoặc nodata hiển thị
            const optionRow = await this.waitForSearchResult(optionText);

            // Nhấn chọn dữ liệu
            logger.debug('Chọn option trong combobox', { field: fieldName, option: optionText });
            try {
                // Thử click thông thường trước (mô phỏng người dùng thật)
                await optionRow.click({ timeout: 3000 });
            } catch (error) {
                console.warn(`[SafeClick] Click thông thường thất bại, chuyển sang dispatchEvent: ${error}`);
                // Nếu thất bại do bị đè/outside viewport -> Bắn DOM event
                await optionRow.dispatchEvent('click');
            }
        }
    }

    /**
     * Kiểm tra combobox có đang bị disable hay không
     */
    async isDisabled(): Promise<boolean> {
        const classAttr = await this.ngSelect.getAttribute('class');
        return classAttr?.includes('ng-select-disabled') ?? false;
    }

    /**
     * Xóa sạch dữ liệu đang chọn
     */
    async clearAll() {
        const fieldName = await this.getName();

        if (await this.isDisabled()) {
            logger.error('Không thể xóa dữ liệu vì combobox đang bị disable', { field: fieldName });
            throw new Error(`[ComboboxComponent]: Combobox "${fieldName}" đang bị disable, không thể xóa`);
        }

        await this.clearAllSpan.click();
    }

    /**
    * Tìm kiếm theo bộ lọc và chọn 1 hoặc nhiều
    * @param option 
    * @param index 
    */
    async selectByFilter(option: string[] | string, index: number) {
        const optionsArray = typeof option === 'string' ? [option] : option;
        if (optionsArray.length === 0) return;

        const fieldName = await this.getName();

        // Mở combobox
        await this.container.click();

        // Định vị ô Filter theo vị trí
        const filterInput = this.filterInputs.nth(index);

        for (const optionText of optionsArray) {

            //Xóa từ khóa
            await filterInput.clear();

            // Nhập từ khóa
            await filterInput.fill(optionText);

            //Chờ cho đến khi có dòng dữ liệu hoặc nodata hiển thị
            const optionRow = await this.waitForSearchResult(optionText);

            // Nhấn chọn dữ liệu
            logger.debug('Chọn option trong combobox', { field: fieldName, option: optionText });
            try {
                // Thử click thông thường trước (mô phỏng người dùng thật)
                await optionRow.click({ timeout: 3000 });
            } catch (error) {
                console.warn(`[SafeClick] Click thông thường thất bại, chuyển sang dispatchEvent: ${error}`);
                // Nếu thất bại do bị đè/outside viewport -> Bắn DOM event
                await optionRow.dispatchEvent('click');
            }

        }
    }
}

/**
 * Hiển thị dạng bảng, tìm kiếm dữ liệu theo tất cả các cột, chỉ chọn 1 giá trị
 * Thay đổi giá trị filterInput
 */
export class NgxCustomSearchComponent extends ComboboxComponent {
    constructor(root: Locator) {
        super(root);
        this.searchInput = this.dropdownPanel.locator('#txtSearchAll');
        this.filterInputs = this.dropdownPanel.locator("tr.filter-row td #txtSearchColumn")
    }

    /**
     * Chọn giá trị theo bộ loc chi tiết từng cột
     * @param columnIDFilter Từ khóa nhập vào Filter cột ID
     * @param columnFilters Mảng các bộ lọc theo cột
     */
    async selectValueByFilter(columnIDFilter?: string, columnFilters?: ColumnFilter[]) {
        // Mở combobox
        await this.container.click();

        // Giá trị chính xác của dòng cần chọn cuối cùng
        let exactValue = "";

        // Xử lý nhập ô Filter cột ID, mặc định cột đầu tiên
        if (columnIDFilter) {
            await this.filterInputs.nth(0).fill(columnIDFilter);
            exactValue = columnIDFilter;
        }

        // Xử lý nhập ô Filter theo từng cột
        if (columnFilters && columnFilters.length > 0) {
            for (const item of columnFilters) {
                if (exactValue === "") exactValue = item.value;
                // Lấy đúng ô input theo chỉ mục cột được truyền vào
                await this.filterInputs.nth(item.index).fill(item.value);
            }
        }

        //Chờ cho đến khi có dòng dữ liệu hoặc nodata hiển thị
        await this.waitForSearchResult(exactValue);

        // Chọn dòng kết quả đầu tiên
        await this.dropdownPanel.locator('.ng-option', { hasText: exactValue }).first().click();
    }
}

/**
 * Hiển thị dạng bảng, tìm kiếm dữ liệu, chọn nhiều giá trị
 * Thay đổi giá trị container, dropdownPanel, filterInput
 */
export class NgxCustomSearchMultiComponent extends ComboboxComponent {
    readonly dropdownSelection: Locator;

    constructor(root: Locator) {
        super(root);
        this.container = root.locator('button.dropdown-toggle')
        this.dropdownSelection = root.locator('.dropdown-selection');
        this.dropdownPanel = root.page().locator("bs-dropdown-container");
        this.searchInput = this.dropdownPanel.locator('[name="searchAll"]');
        this.clearAllSpan = this.container.locator("span[title='remove']");
        this.filterInputs = this.dropdownPanel.locator("tr.filter-row input")
    }

    /**
     * Override: component này dùng dropdown Bootstrap (button.dropdown-toggle)
     */
    async isDisabled(): Promise<boolean> {
        return await this.container.isDisabled();
    }

    // Lấy danh sách các giá trị đang chọn
    async getSelectedValues(): Promise<string[]> {
        // Kiểm tra combobox có giá trị
        if (!(await this.dropdownSelection.isVisible())) {
            return [];
        }
        const selectedSpan = await this.dropdownSelection.textContent();
        if (!selectedSpan) return [];

        // Tách chuỗi bằng dấu chấm phẩy ";" và cắt khoảng trắng của từng phần tử
        return selectedSpan.split(';').map(item => item.trim()).filter(item => item.length > 0);
    }
}

/**
 * Hiển thị dạng danh sách, tìm kiếm dữ liệu theo tất cả các cột, chỉ chọn 1 giá trị
 * Thay đổi giá trị filterInput
 */
export class NgSelectCustomComponent extends ComboboxComponent {
    //readonly dropdownSelection: Locator;
    constructor(root: Locator) {
        super(root);
        this.searchInput = this.dropdownPanel.locator('[name="txtSearch"]');
        //this.dropdownSelection = root.locator('.ng-has-value');
    }
}

/**
 * Sử dụng riêng cho combobox chọn hợp đồng
 * Thay đổi option của dropdown này là hàng bảng
 */
export class CBOContractComponent extends NgxCustomSearchMultiComponent {
    constructor(root: Locator) {
        super(root);
    }

    protected override get optionRows(): Locator {
        return this.dropdownPanel.locator('table tbody tr.data-row');
    }
}
