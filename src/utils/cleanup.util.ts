import { test } from '@playwright/test';
import { ensureHas } from '@utils/data/data.util';
import type { Deletable, Register, Revokeable } from '@api/core/types';

export interface CleanupOptions {
    id: string;
    note?: string;
}

export type CleanupAction = 'delete' | 'revoke';

/** Gắn service với action để TypeScript vẫn kiểm tra đúng cặp tại nơi gọi */
type Cleanup =
    | { service: Deletable; action: 'delete' }
    | { service: Revokeable; action: 'revoke' };

type FoundRecord = { createdId?: string; createdCode?: string };

type TrackCreatedOptions = {
    /** Tên thực thể để ghi vào tên step và thông báo lỗi, ví dụ 'giá mua FCL' */
    label: string;
    /** Hàm tìm lại bản ghi vừa tạo, thường bọc getIdReadBackConfig */
    find: () => Promise<FoundRecord>;
    register: Register;
    cleanup: Cleanup;
    /** true: bắt buộc lấy được mã; false (mặc định): chỉ cần id */
    requireCode?: boolean;
};

export async function trackCreated(
    opts: TrackCreatedOptions & { requireCode: true },
): Promise<{ id: string; code: string }>;
export async function trackCreated(
    opts: TrackCreatedOptions,
): Promise<{ id: string; code?: string }>;
export async function trackCreated(
    opts: TrackCreatedOptions,
): Promise<{ id: string; code?: string }> {
    const { label, find, register, cleanup, requireCode = false } = opts;

    return await test.step(`Tìm ${label} vừa tạo qua API và đăng ký dọn dẹp`, async () => {
        const found = await find();

        const keys = requireCode ? (['createdId', 'createdCode'] as const) : (['createdId'] as const);
        const { createdId, createdCode } = ensureHas(found, [...keys], `Không tìm thấy ${label} vừa tạo qua API`);

        // Đăng ký ngay khi có id để fail giữa chừng vẫn được dọn
        if (cleanup.action === 'revoke') {
            register(createdId, cleanup.service, 'revoke');
        } else {
            register(createdId, cleanup.service, 'delete');
        }

        return { id: createdId, code: createdCode };
    });
}