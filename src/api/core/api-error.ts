import { ApiErrorOptions } from "./types";

/**
 * Đại diện cho 1 lỗi xảy ra khi gọi API
 * Bao gồm cả 2 trường hợp:
 *  - Lỗi network/connection (server không phản hồi, timeout, DNS fail...)
 *  - Lỗi HTTP status trả về từ server (400, 401, 500...)
 *
 * Mục đích: giữ nguyên type information (method, url, status, request, response)
 * khi lỗi được throw và catch ở nơi khác (Service, Fixture, Validator),
 * thay vì chỉ throw 1 Error thường và mất hết context.
 */
export class ApiError extends Error {

    public readonly method: string;
    public readonly url: string;

    /**
     * status = 0 là quy ước cho lỗi network/connection (không nhận được HTTP response)
     * status > 0 là mã lỗi HTTP thực tế trả về từ server
     */
    public readonly status: number;

    public readonly request?: unknown;
    public readonly response?: unknown;

    constructor(options: ApiErrorOptions) {

        super(
            options.message ??
            `${options.method} ${options.url} thất bại với status ${options.status}`
        );

        this.name = "ApiError";

        this.method = options.method;
        this.url = options.url;
        this.status = options.status;
        this.request = options.request;
        this.response = options.response;

        // Cần thiết khi extends built-in class (Error) và compile target ES5/ES6
        // để instanceof ApiError hoạt động đúng
        Object.setPrototypeOf(this, ApiError.prototype);
    }

    /**
     * Chuỗi log ngắn gọn, dùng để in ra console/logger khi lỗi xảy ra
     */
    public summary(): string {
        return [
            "========== LỖI GỌI API ==========",
            `Method  : ${this.method}`,
            `URL     : ${this.url}`,
            `Status  : ${this.status}`,
            `Response: ${JSON.stringify(this.response)}`,
            "=================================="
        ].join("\n");
    }

    /**
     * Object đầy đủ để attach vào Playwright report hoặc ghi log dạng JSON
     */
    public toJSON() {
        return {
            method: this.method,
            url: this.url,
            status: this.status,
            message: this.message,
            request: this.request,
            response: this.response
        };
    }
}