/**
 * Payload Request Tạo mới
 */
export interface FCLQuotationPayload {
    quotationRoute?: QuotationRoute;
}

export interface QuotationRoute {
    miniumCostAmount?: number;
    priceSaleRequest?: number;
    priceBack?: number;
    customerId?: string;
    note?: string;
}

/**
 * Params Tìm kiếm
 */
export interface FCLQuotationSearchParams {
    fromDate: string;
    toDate: string;
}

/**
 * Response Body Tìm kiếm
 */
export interface FCLQuotationSearchResponse {
    value: FCLQuotationValue;
}

export interface FCLQuotationValue {
    accepted: FCLQuotationItem[];
}

export interface FCLQuotationItem {
    id: string;
    customerId: string;
    profit: number;
    finalPrice: number;
    code: string;
    note:string;
}

/**
 * Payload Request Hủy
 */
export interface RevokePayload {
    quotationId: string;
    status: number;
}