import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from '@ui/pages/base.page';
import { FlexibleColumnMap } from '@utils/verification/data-verification';
import { FieldMismatch, VerifyOptions } from '@utils/verification/field-verifier';
import { FormField, findFormMismatches, expectFormData } from '@utils/verification/form-verification';

/**
 * Trang chỉnh sửa riêng (thay cho dialog). Chờ trang tải xong rồi dùng cùng logic đối chiếu với EditDialog.
 * Page của từng feature kế thừa class này, khai báo `fields` và `backToList()`.
 */
export class EditPage extends BasePage {
    constructor(page: Page, url: string, headingTitle: string) {
        super(page, url, headingTitle);
    }

    /** Điểm đồng bộ: trang đã tải xong (gọi nhiều lần vẫn an toàn) */
    async waitForLoaded(): Promise<void> {
        await expect(this.pageHeading).toBeVisible();
    }

    async findMismatches<T extends object>(
        fields: FormField[],
        formColumnMap: FlexibleColumnMap<T>,
        data: Partial<T>,
        options?: VerifyOptions,
    ): Promise<FieldMismatch[]> {
        return findFormMismatches(fields, formColumnMap, data, options);
    }

    async expectData<T extends object>(
        fields: FormField[],
        formColumnMap: FlexibleColumnMap<T>,
        data: Partial<T>,
        options?: VerifyOptions,
    ): Promise<void> {
        await expectFormData(fields, formColumnMap, data, options);
    }
}