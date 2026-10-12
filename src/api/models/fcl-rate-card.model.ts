/**
 * Params Tìm kiếm
 */
export interface FCLRateCardSearchParams {
    fromDate: string;
    toDate: string;
}

/**
 * Response Body Tìm kiếm
 */
export interface FCLRateCardSearchResponse {
    value: FCLRateCardValue;
}

export interface FCLRateCardValue {
    updating: FFCLRateCardItem[];
}

export interface FFCLRateCardItem {
    id: string;
    rateCardName:string;
    code: string;
}