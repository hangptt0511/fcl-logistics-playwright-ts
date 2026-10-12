import fs from 'fs';
import path from 'path';
import { Page } from '@playwright/test';
import { UserRole, Session, StorageState } from './types';
import { logger } from "@utils/logger";

/**
 * Quản lý session (storageState) theo từng role
 */
export class SessionManager {

    private static readonly sessionDir = path.resolve(process.cwd(), 'playwright/.auth');

    /** Cảnh báo sớm nếu access token còn dưới ngưỡng này (phút) trước khi hết hạn */
    private static readonly EXPIRY_WARNING_THRESHOLD_MINUTES = 30;

    /**
     * Cache session trong bộ nhớ theo role, tránh đọc + parse file JSON
     */
    private static readonly cache = new Map<UserRole, Session>();

    /**
     * Load session theo role - ưu tiên lấy từ cache, chỉ đọc file khi cache chưa có
     */
    static get(role: UserRole): Session {
        const cached = this.cache.get(role);
        if (cached) {
            return cached;
        }

        const sessionPath = this.getSessionPath(role);

        if (!fs.existsSync(sessionPath)) {
            throw new Error(`[SessionManager] Không tìm thấy file session: ${sessionPath}`);
        }

        const storageState = this.readStorageState(sessionPath);
        const session = this.extractSession(storageState, role);

        this.warnIfExpiringSoon(session, role);

        this.cache.set(role, session);
        logger.debug('Đã tải session từ file và lưu vào cache', { role });

        return session;
    }

    /**
     * Lưu Playwright storageState theo role
     */
    static async save(role: UserRole, page: Page): Promise<void> {
        fs.mkdirSync(this.sessionDir, { recursive: true });
        const sessionPath = this.getSessionPath(role);

        await page.context().storageState({ path: sessionPath });

        // Xoá cache cũ (nếu có) vì session file vừa được ghi đè
        // lần get() tiếp theo sẽ đọc lại từ file mới
        this.cache.delete(role);

        logger.success('Đã lưu session thành công', { role, path: sessionPath });
    }

    /**
     * Xoá cache thủ công - dùng khi cần ép SessionManager đọc lại session mới nhất từ file
     * (vd: sau khi refresh token, hoặc re-login giữa suite)
     */
    static clearCache(role?: UserRole): void {
        if (role) {
            this.cache.delete(role);
        } else {
            this.cache.clear();
        }
    }

    private static readStorageState(sessionPath: string): StorageState {
        try {
            const content = fs.readFileSync(sessionPath, 'utf-8');
            return JSON.parse(content) as StorageState;
        } catch (error) {
            throw new Error(
                `[SessionManager] Không đọc/parse được file session.\nFile: ${sessionPath}\nLỗi: ${error}`
            );
        }
    }

    private static extractSession(storageState: StorageState, role: UserRole): Session {
        const localStorageItems = storageState.origins?.flatMap(origin => origin.localStorage ?? []) ?? [];
        const storage = Object.fromEntries(localStorageItems.map(item => [item.name, item.value]));

        const accessToken = storage['access_token'];
        if (!accessToken) {
            throw new Error(`[SessionManager] Không tìm thấy access_token cho role "${role}"`);
        }

        return {
            accessToken,
            refreshToken: storage['refresh_token'],
            expiresAt: storage['expires_at'],
            tokenType: 'Bearer',
        };
    }

    /**
     * Cảnh báo nếu token đã hết hạn hoặc sắp hết hạn
     * (expires_in của hệ thống hiện tại là 14400s = 4 tiếng)
     */
    private static warnIfExpiringSoon(session: Session, role: UserRole): void {
        const expiresAt = Number(session.expiresAt);
        if (Number.isNaN(expiresAt)) return;

        const remainingMinutes = (expiresAt - Date.now()) / 1000 / 60;

        if (remainingMinutes <= 0) {
            logger.warn(`Session của role "${role}" đã HẾT HẠN`, {
                thoiDiemHetHan: new Date(expiresAt).toISOString(),
            });
        } else if (remainingMinutes < this.EXPIRY_WARNING_THRESHOLD_MINUTES) {
            logger.warn(`Session của role "${role}" sắp hết hạn`, {
                soPhutConLai: Math.round(remainingMinutes),
            });
        }
    }

    private static getSessionPath(role: UserRole): string {
        return path.join(this.sessionDir, `${role}-session.json`);
    }
}