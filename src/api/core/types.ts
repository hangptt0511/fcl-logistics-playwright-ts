import { CleanupOptions } from "@utils/cleanup.util";

// Kiểu dữ liệu hợp lệ cho từng giá trị Query Param
export type QueryParamValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | Array<string | number | boolean>;

// Chấp nhận cả Record chuẩn lẫn Record<string, unknown> cho Negative Testing
export type ApiQueryParams =
    | Record<string, QueryParamValue>
    | Record<string, unknown>;

export interface ApiRequest<TBody = unknown> {

    url: string;

    data?: TBody;

    params?: ApiQueryParams;

    headers?: Record<string, string>;

    timeout?: number;
    contentType?: "application/x-www-form-urlencoded";

}

//API Response
export interface ApiResponse<T> {
    status: number;
    data: T;
}

export interface ApiErrorOptions {
    method: string;
    url: string;
    status: number;
    request?: unknown;
    response?: unknown;
    message?: string;
}

export type UserRole =
    | "admin"
    | "sales"
    | "pricing";

export interface Session {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: string;
    tokenType: string;
}

export interface StorageState {
    cookies: unknown[];

    origins: {
        origin: string;

        localStorage: {
            name: string;
            value: string;
        }[];
    }[];
}

/**
 * Tầng Envelope Response Wrapper chuẩn của Backend API (.NET / Java Enterprise Pattern)
 * Tất cả API Response Body từ Server đều bọc trong cấu trúc này
 */
export interface BaseApiResponseWrapper<T = any> {
    /** 
     * Dữ liệu chính (Payload) của API hoặc thông tin lỗi bóc tách
     * - Nếu 200 OK: Chứa object/array kết quả nghiệp vụ
     * - Nếu 400 Bad Request: Chứa object lỗi validation dạng { "Master.effectiveOn": ["..."] }
     */
    value: T;

    /** Mã HTTP Status Code phản hồi từ tầng BE (VD: 200, 400) */
    status?: number;

    /** Cờ đánh dấu response thành công hay thất bại chuẩn từ API Result Filter */
    isResponseResult?: boolean;

    /** Mã thông báo / Mã lỗi định danh từ Backend (VD: 'MSG_INSERT_SUCCESS', 'MSG_DUPLICATE_RECORD') */
    code?: string;

    /** Thông điệp / Cảnh báo chi tiết trả về từ Backend */
    message?: string;

    /** Danh sách các lỗi validation phân theo trường (nếu backend trả riêng ngoài `value`) */
    errors?: Record<string, string[]>;

    /** Hỗ trợ các trường bổ sung linh hoạt từ Backend */
    [key: string]: unknown;
}
export interface Deletable {
    delete(id: string): Promise<ApiResponse<unknown>>;
}

export interface Revokeable {
    revoke(options: CleanupOptions): Promise<ApiResponse<unknown>>;
}

export interface Register {
    (id: string | undefined, service: Deletable, action?: 'delete'): void;
    (id: string | undefined, service: Revokeable, action: 'revoke'): void;
}
