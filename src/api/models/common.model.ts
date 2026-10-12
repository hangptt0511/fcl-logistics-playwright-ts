import { ApiResponse } from '../core/types';
export interface ExpectedResponse {
    status: number;
    name?: string;
    value?: string;
    message?: string;
    errorField?: string;
    errorContains?: string;
    verifyCodeMatchesExisting?: boolean;
}

export interface GenericCreateTestCase<TPayload> {
    id: string;
    description: string;
    severity: string;
    story: string;
    tags: string[];
    payload: Partial<TPayload>;
    expectedResponse: ExpectedResponse;
    requiresSetup?: boolean;
}

/**
 * Config đặc thù của từng module, truyền vào BaseValidator.verifyCreateTestCase
 * để tái sử dụng chung logic orchestrate/cleanup mà không cần biết chi tiết
 * cấu trúc search request/response của module đó.
 */
export interface ReadBackConfig<TPayload, TSearchResponse, TItem> {
    /** Gọi API search dựa trên payload đã gửi khi tạo mới */
    searchApiCall: (payload: Partial<TPayload>) => Promise<ApiResponse<TSearchResponse>>;
    /** Trích mảng item từ response search (unwrap envelope nếu cần) */
    extractItems: (data: TSearchResponse) => TItem[];
    /** Điều kiện xác định 1 item có phải là bản ghi vừa tạo/trùng hay không */
    matchItem: (item: TItem, payload: Partial<TPayload>) => boolean;
    /** Lấy id từ item, dùng cho cleanup */
    getId: (item: TItem) => string;
    /** Lấy code từ item (nếu module có field code, dùng cho case duplicate) */
    getCode?: (item: TItem) => string | undefined;
    /**
     * Trích mã động từ message lỗi (vd: "...đã được tạo với mã = 0010926/FBUY-VNHCM").
     * Mỗi module có format message khác nhau nên để module tự cung cấp regex,
     * BaseValidator chỉ dùng nếu có, không tự đoán format.
     */
    extractCodeFromMessage?: (message: string) => string | undefined;
     /**
     * Tuỳ chọn: chọn ra phần payload cần đem so sánh với item trả về từ search.
     * Dùng khi response search chỉ tương ứng với 1 phần của payload gốc
     * (vd: response chính là nội dung của payload.master, không phải toàn bộ payload).
     * Nếu không cung cấp, mặc định dùng nguyên testCase.payload để so sánh.
     */
    buildExpectedForMatch?: (payload: Partial<TPayload>) => Record<string, unknown>;
}

/**
 * Payload Request Gửi/Duyệt/Hủy
 */
export interface RequestPayload {
    action: number;
    id: string;
    note: string;
}