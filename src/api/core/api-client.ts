import { APIRequestContext, APIResponse } from "@playwright/test";
import { SessionManager } from "./session-manager"
import { ApiRequest, ApiResponse, UserRole } from "./types";
import { ResponseDecoder } from './response-decoder';
import { normalizeQueryParams } from '@utils/data/query-params-normalizer';
import { logger } from "@utils/logger";
import { ApiError } from './api-error';

/**
 * Client trung tâm để gửi HTTP request tới API
 * Tự động: inject Bearer token theo role, decode response (JSON/MessagePack/GZIP),
 * log lại từng request, và phân biệt lỗi network với lỗi HTTP status
 */
export class ApiClient {

    constructor(
        private readonly request: APIRequestContext,
        private readonly role?: UserRole
    ) { }


    async get<TResponse>(request: ApiRequest): Promise<ApiResponse<TResponse>> {
        return this.send<TResponse>("GET", request);
    }

    async post<TRequest, TResponse>(request: ApiRequest<TRequest>): Promise<ApiResponse<TResponse>> {
        return this.send<TResponse>("POST", request);
    }

    async put<TRequest, TResponse>(request: ApiRequest<TRequest>): Promise<ApiResponse<TResponse>> {
        return this.send<TResponse>("PUT", request);
    }

    async patch<TRequest, TResponse>(request: ApiRequest<TRequest>): Promise<ApiResponse<TResponse>> {
        return this.send<TResponse>("PATCH", request);
    }


    async delete<TResponse>(request: ApiRequest): Promise<ApiResponse<TResponse>> {
        return this.send<TResponse>("DELETE", request);
    }

    /**
     * Hàm lõi xử lý mọi loại request (GET/POST/PUT/PATCH/DELETE)
     * Luồng xử lý: build headers/body → inject token → gửi request → log → decode response
     */
    private async send<TResponse>(
        method: string,
        request: ApiRequest
    ): Promise<ApiResponse<TResponse>> {

        const start = Date.now();
        const upperMethod = method.toUpperCase();
        const hasPayloadMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

        // Chuẩn hoá query params (bỏ null/undefined, ép object thành JSON string)
        const cleanParams = normalizeQueryParams(request.params);

        const headers: Record<string, string> = {
            Accept: "application/json",
            ...request.headers
        };

        // Chỉ build body cho các method có payload
        let body: unknown = undefined;
        if (hasPayloadMethods.includes(upperMethod) && request.data !== undefined) {
            if (request.contentType === "application/x-www-form-urlencoded") {
                // Form-urlencoded: encode data thành chuỗi dạng key=value&...
                headers["Content-Type"] = "application/x-www-form-urlencoded";
                body = new URLSearchParams(request.data as Record<string, string>).toString();
            } else {
                // Mặc định: gửi JSON
                headers["Content-Type"] = "application/json";
                body = request.data;
            }
        }

        // Tự động đính kèm Bearer token nếu ApiClient được gán role (đã login qua SessionManager)
        if (this.role) {
            const session = SessionManager.get(this.role);
            headers.Authorization = `${session.tokenType} ${session.accessToken}`;
        }

        let response: APIResponse;
        try {
            response = await this.request.fetch(request.url, {
                method,
                data: body,
                params: cleanParams,
                headers,
                timeout: request.timeout,
            });
        } catch (err) {
            // Lỗi network thực sự (server không phản hồi, timeout, DNS fail...)
            // Khác với lỗi HTTP status (400/500) - trường hợp đó vẫn có response hợp lệ, không rơi vào catch này
            const apiError = new ApiError({
                method,
                url: request.url,
                status: 0, // quy ước: status = 0 nghĩa là lỗi network/connection, không phải mã HTTP thật
                request: request.data,
                response: (err as Error).message,
            });
            logger.error(apiError.summary(), { nguyenNhan: err });
            throw apiError;
        }

        const duration = Date.now() - start;
        const status = response.status();

        // Log lại request: mức "warn" nếu API trả lỗi (status >= 400), còn lại "debug" để tránh rác log khi chạy CI
        const logLevel = status >= 400 ? 'warn' : 'debug';
        logger[logLevel](`${method} ${request.url}`, { status, thoiGianMs: duration });

        return this.parseResponse<TResponse>(response);
    }

    /**
     * Giải mã response body trả về từ API theo đúng định dạng backend sử dụng
     * (JSON / MessagePack / GZIP - xử lý chi tiết nằm trong ResponseDecoder)
     */
    private async parseResponse<TResponse>(response: APIResponse): Promise<ApiResponse<TResponse>> {
        const status = response.status();
        // Lấy content-type để ResponseDecoder biết cách giải mã (JSON/MessagePack/GZIP)
        const contentType = response.headers()["content-type"] ?? "";
        // Đọc buffer thô 1 lần duy nhất - tránh lỗi "body already read"
        const buffer = await response.body();
        // Giải mã response body theo đúng định dạng backend trả về
        const data = await ResponseDecoder.decode(buffer, contentType);

        return { status, data: data as TResponse };
    }
}