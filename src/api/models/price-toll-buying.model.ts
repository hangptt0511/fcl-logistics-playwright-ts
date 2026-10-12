import { GenericCreateTestCase } from '@api/models/common.model';

//Bảng thông chính
export interface PriceTollBuyingMasterPayload {
    /** Mã NCC cung cấp */
    botId: string;
    /** Mã loại tiền tệ */
    currencyId: string;
    /** Thuế suất (%) */
    vatrate: number;
    /** ID hợp đồng */
    contractId: number;
    /** ID loại phương tiện */
    vehicleTypeId: number;
    /** Ngày hiệu lực hợp đồng (định dạng YYYY-MM-DD) */
    effectiveOn: string;
    /** Ngày hết hạn hợp đồng (định dạng YYYY-MM-DD) */
    expiryOn: string;
    /** Bao gồm thuế */
    includedVat: boolean;
    /** Giá tiền */
    price: number;
    /** Giá tiền bao gồm thuế */
    priceVat: number;
    note?: string;
}

//Thông tin chi tiết danh sách phương tiện
export interface PriceTollBuyingDetailPayload {
    /** ID phương tiện */
    vehicleId: number;
}

//Thông tin danh sách địa điểm
export interface PriceTollBuyingPlacePayload {
    /** ID địa điểm */
    placeId: string;
}

//Payload Request Tạo mới
export interface PriceTollBuyingPayload {
    /** Thông tin chính */
    Master: PriceTollBuyingMasterPayload;
    /** Danh sách phương tiện */
    Details: PriceTollBuyingDetailPayload[];
    /** Danh sách địa điểm */
    Places: PriceTollBuyingPlacePayload[];
}

//Response Body Tạo mới
export interface PriceTollBuyingResponse {
    message: string;
    status: number;
}

//Params Tìm kiếm
export interface PriceTollBuyingSearchParams {
    FromDate: string;
    ToDate: string;
}

//Response Body Tìm kiếm
export interface PriceTollBuyingSearchResponse {
    value: PriceTollBuyingValue;
}

export interface PriceTollBuyingValue {
    accepted: PriceTollBuyingItem[];
    pending: PriceTollBuyingItem[];
    rejected: PriceTollBuyingItem[];
    revoked: PriceTollBuyingItem[];
    updating: PriceTollBuyingItem[];
}

export interface PriceTollBuyingItem {
    botId: string;
    branchId: string;
    code: string;
    contractId: string;
    contractType: string;
    currencyId: string;
    datetimeCreated: string;
    effectiveOn: string;
    expiryOn: string;
    id: string;
    includedVat: boolean
    oldExpiryOn: string;
    price: number
    priceVat: number
    status: string;
    userCreated: string;
    vatrate: number
    vehicleTypeId: number
}

//Test Case Tạo mới Price Toll Buying
export type PriceTollBuyingCreateTestCase = GenericCreateTestCase<PriceTollBuyingPayload>;