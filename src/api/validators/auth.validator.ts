import { ConnectResponse } from "@api/models/auth.model"
import { ApiResponse } from "@api/core/types";
import { logger } from "@utils/logger";

export class AuthValidator {
    static validateLoginResponse(res: ApiResponse<ConnectResponse>, step: number) {
        if (res.status !== 200) {
            logger.error(`Đăng nhập bước ${step} thất bại - Status code không hợp lệ`, {
                expectedStatus: 200,
                actualStatus: res.status,
                responseBody: res.data,
            });
            throw new Error(`[AUTH SETUP] Đăng nhập bước ${step} thất bại - Status code không hợp lệ: ${res.status}`);
        }

        if (!res.data?.refresh_token) {
            logger.error(`Đăng nhập bước ${step} thất bại  - Thiếu refresh_token trong response data`, {responseData: res.data});
            throw new Error(`[AUTH SETUP] Đăng nhập bước ${step} thất bại - Thiếu refresh_token trong response data`);
        }
    }
}