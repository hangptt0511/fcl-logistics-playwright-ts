import { FlexibleColumnMap } from '@utils/verification/data-verification';
import { FieldMismatch, VerifyOptions } from '@utils/verification/field-verifier';
import { FormField, findFormMismatches, expectFormData } from '@utils/verification/form-verification';
import { BaseDialog } from './base-dialog.component';

/** Dialog chỉnh sửa: chờ dialog mở rồi dùng logic đối chiếu chung với trang chỉnh sửa. */
export class EditDialog extends BaseDialog {
    async findMismatches<T extends object>(
        fields: FormField[],
        formColumnMap: FlexibleColumnMap<T>,
        data: Partial<T>,
        options?: VerifyOptions,
    ): Promise<FieldMismatch[]> {
        await this.waitForOpen();
        return findFormMismatches(fields, formColumnMap, data, options);
    }

    async expectData<T extends object>(
        fields: FormField[],
        formColumnMap: FlexibleColumnMap<T>,
        data: Partial<T>,
        options?: VerifyOptions,
    ): Promise<void> {
        await this.waitForOpen();
        await expectFormData(fields, formColumnMap, data, options);
    }
}