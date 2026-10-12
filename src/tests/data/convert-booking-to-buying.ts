import { PriceFCLBuyingPayload } from "@api/models/price-fcl-buying.model";
import { FCLBookingData } from "@ui/models/fcl-booking.model";
import { FCLQuotationData } from "@ui/models/fcl-quotation.model";
import { FCLRateCardData } from "@ui/models/fcl-rate-card.model";
import { getDateByWeekday, uniqueNote } from "@utils/data/test-data.util";
import { Weekday } from '@utils/data/date.util';

// ═══════════════ 1. DỮ LIỆU PHỤ THUỘC MÔI TRƯỜNG (chỉ sửa ở đây khi đổi môi trường) ═══════════════

const CUSTOMER = 'LÊ XUÂN';
const CUSTOMER_ID = '00101407560';
const PLACE_FROM = 'Đăk Cấm, Quảng Ngãi';
const PLACE_TO = 'Tường Hạ, Sơn La';
const WEIGHT_RANGE = '1.00 - 5.00 Ton';
const CONTAINER_TYPE = 'Cont 20DC';
const WEEKDAYS: Weekday[] = ['Friday']
const PRICE = 2570000;
const VAT_RATE = 8;

const SALE_COST = 3450000;
const CONTRACT_NO = 'DASH-LEXUAN/012026';
const CARGO_TYPE = ['Export'];
const NET_WEIGHT = 3;

const PRICE_FCL_BUYING: Readonly<PriceFCLBuyingPayload> = Object.freeze({
    placeFrom: 'd1d5c6e2-a949-4e54-8ce5-00b82beb87f5',
    placeTo: '3f66c52a-0d00-45b0-91f4-000a80622b2c',
    roadId: 'Road',
    containerTypeId: '20DC',
    weightRangeId: 11,
    price: PRICE,
    currencyId: 'VND',
    supplierId: '0316976133',
    effectiveOn: '2025-04-01',
    expiryOn: '2060-03-17',
    contractId: 5052,
    canceledFreightPecent: '1;2.3',
    returnAssocFreightPecent: '1',
    weekdays: 'Friday',
    vatrate: VAT_RATE,
    priceIncludedVat: PRICE * (1 + VAT_RATE / 100),
    serviceTypeId: 1,
    poReceiptId: '9969b4df-5ec8-4f13-9250-00bb4d3ddbf5',
    poTransferId: '283a2f99-3b2f-49e9-9001-01044caf096f',
    poDeliveryId: 'd878c284-0527-411b-8e21-00d7afa1b318',
    customerId: CUSTOMER_ID
});

// ═══════════════ 2. DỮ LIỆU ĐẦU VÀO CỦA LUỒNG ═══════════════

//Payload giá mua: tạo mới mỗi lần gọi và gắn note duy nhất
export const buildPriceFclBuyingPayload = (): PriceFCLBuyingPayload => ({
    ...PRICE_FCL_BUYING,
    note: uniqueNote(),
});

// Dữ liệu kỳ vọng điền sẵn trong form Create FCL Quotation
export const EXPECTED_CREATE_QUOTATION: FCLQuotationData = {
    containerType: CONTAINER_TYPE,
    weightRange: WEIGHT_RANGE,
    poLoading: PLACE_FROM,
    poDischarge: PLACE_TO,
    weekdays: WEEKDAYS,
};

//Data bảng phân tích
const FCL_QUOTATION_DATA: FCLQuotationData = {
    customer: CUSTOMER,
    cargoType: CARGO_TYPE,
    netWeight: NET_WEIGHT,
    saleCost: SALE_COST,
};
//Tạo mới mỗi lần gọi và gắn Note duy nhất
export const buildFCLQuotationData = (): FCLQuotationData => ({
    ...FCL_QUOTATION_DATA,
    note: uniqueNote(),
});

// Dữ liệu kỳ vọng khi Quotation Quickly create a Quotation
export const EXPECTED_QUOTATION_STATUS = 'Auto Accepted';
export const EXPECTED_QUOTATION_TYPE = 'Hire';
export const EXPECTED_QUOTATION_TOTAL = SALE_COST;
export const EXPECTED_QUOTATION_PROFIT = SALE_COST - PRICE;
export const EXPECTED_QUOTATION: FCLQuotationData = {
    ...FCL_QUOTATION_DATA,
    type: EXPECTED_QUOTATION_TYPE,
    total: EXPECTED_QUOTATION_TOTAL,
    profit: EXPECTED_QUOTATION_PROFIT,
    status: EXPECTED_QUOTATION_STATUS,
};

//Data bảng giá
const RATE_CARD_DATA: FCLRateCardData = {
    customer: CUSTOMER,
    contractNo: CONTRACT_NO,
};

//Tạo mới mỗi lần gọi và gắn rateCardName duy nhất
export const buildRateCardData = (): FCLRateCardData => ({
    ...RATE_CARD_DATA,
    rateCardName: uniqueNote(),
});

// Dữ liệu kỳ vọng khi Add New Rate Card
export const EXPECTED_RATE_CARD_PRICCE = SALE_COST;
export const EXPECTED_RATE_CARD: FCLRateCardData = {
    ...RATE_CARD_DATA,
    price: EXPECTED_RATE_CARD_PRICCE,
};

//Data chuyển đổi đơn đặt hàng
const CONVERT_BOOKING_DATA: FCLBookingData = {
    quantity: 1,
};
//Tạo mới mỗi lần gọi và gắn note duy nhất
export const buildConvertBookingData = (): FCLBookingData => ({
    ...CONVERT_BOOKING_DATA,
    pickupDate: getDateByWeekday(WEEKDAYS[0]),
    remark: uniqueNote(),
});

// Dữ liệu kỳ vọng khi Convert Booking
export const EXPECTED_BOOKING_STATUS = 'New';
export const EXPECTED_BOOKING: FCLBookingData = {
    ...CONVERT_BOOKING_DATA,
    customer: CUSTOMER,
    type: FCL_QUOTATION_DATA.cargoType,
    status: EXPECTED_BOOKING_STATUS,
};