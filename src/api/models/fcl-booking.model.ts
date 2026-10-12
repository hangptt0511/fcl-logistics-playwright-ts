/**
 * Params Tìm kiếm
 */
export interface FCLBookingSearchParams {
    fromDate: string;
    toDate: string;
    type: string;
}

/**
 * Response Body Tìm kiếm
 */
export interface FCLBookingSearchResponse {
    value: FCLBookingItem[];
}

export interface FCLBookingItem {
    id: string;
    remark: string;
    code: string;
}
