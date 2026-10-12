import { GenericCreateTestCase } from '@api/models/common.model';

//Payload Request Tạo mới
export interface PriceFCLBuyingPayload {
    supplierId: string;
    placeFrom: string;
    placeTo: string;
    poReceiptId?: string;
    poTransferId?: string;
    poDeliveryId?: string;
    serviceTypeId: number | string;
    customerId?: string;
    roadId: string;
    weightRangeId: number;
    containerTypeId: string;
    contractId?: number;
    weekdays?: string;
    currencyId: string;
    price: number;
    vatrate: number;
    includeVat?: boolean;
    projectName?: string;
    //__;__ (Nếu là số thập phân thì nhập dấu ".")
    returnAssocFreightPecent?: string,
    //__;__ (Nếu là số thập phân thì nhập dấu ".")
    canceledFreightPecent?: string,
    note?: string,
    inactive?: boolean,
    isDangerousGoods?: boolean,
    isRefrigeratedGoods?: boolean,
    //YYYY-MM-DD
    effectiveOn?: string;
    //YYYY-MM-DD
    expiryOn?: string;
    priceIncludedVat: number;
}

//Response Body Tạo mới
export interface PriceFCLBuyingResponse {
    name: string;
    resourceNotFound: boolean;
    value: string;
}

//Params Tìm kiếm
export interface PriceFCLBuyingSearchParams {
    fromDate: string;
    toDate: string;
    placeFrom: string;
    placeTo: string;
    supplierId: string
}

//Response Body Tìm kiếm
export interface PriceFCLBuyingSearchResponse {
    value: PriceFCLBuyingItem[];
}
export interface PriceFCLBuyingItem {
    id: string;
    branchId: string;
    placeFrom: string;
    placeTo: string;
    roadId: string;
    containerTypeId: string;
    weightRangeId: number;
    serviceTypeId: number;
    price: number;
    currencyId: string;
    supplierId: string;
    userCreated: string;
    datetimeCreated: string;
    status: number;
    code: string;
    vatrate: number;
    priceIncludedVat: number;
    poReceiptId: string;
    poTransferId: string;
    poDeliveryId: string;
    customerId: string;
    contractId: number;
    weekdays: string;
    includeVat: boolean;
    projectName: string;
    returnAssocFreightPecent: string;
    canceledFreightPecent: string;
    note: string;
    inactive: boolean;
    isDangerousGoods: boolean;
    isRefrigeratedGoods: boolean;
    effectiveOn: string;
    expiryOn: string;
}

export type PriceFCLBuyingCreateTestCase = GenericCreateTestCase<PriceFCLBuyingPayload>;