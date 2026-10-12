import { FCL_BookingTestCase, ExpectedFieldError, FCLBookingData, REQUIRED_FIELDS } from '@ui/models/fcl-booking.model';
import { withIds, withUniqueNote, makeValid, getCurrentDatetime, getCurrentDate, getRelativeDate, getRelativeDatetime } from '@utils/data/test-data.util'

// ═══════════════ 1. DỮ LIỆU PHỤ THUỘC MÔI TRƯỜNG ═══════════════
const CUSTOMER = 'LÊ XUÂN';
const CONTAINER_TYPE = 'Cont 20DC';
const PLACES = {
    placeFrom: 'Tân An, Long An',
    placeOfReceipt: 'Quân Chua, Đà Nẵng',
    placeOfLoading: 'Thái Hòa, Hà Nội',
    placeTo: 'Tường Hạ, Sơn La',
    placeOfLoadingUnloading: 'Châu Bính, Nghệ An',
    placeOfDischarge: 'Tân Lợi, Đắk Lắk',
    placeOfReturn: 'Quảng La, Quảng Ninh',
};

// ═══════════════ 2. THÔNG BÁO LỖI ═══════════════
const MSG = {
    required: 'This field is required',
    pickupGteBooking: 'This field must be greater or equal the value of field Booking Date',
    receiptLteEta: 'This field must be less or equal ETA',
    etdRange: 'This field must be greater or equal Receipt Date and less or equal ETD',
    etaRange: 'This field must be greater or equal ETD and less or equal Return Date',
    returnGtePickup: 'This field must be greater or equal the value of field Pickup Date',
} as const;

// ═══════════════ 3. TYPE & HELPER ═══════════════
/** Case thêm mới thành công: không có expectedErrors */
export type CreateCase = Omit<FCL_BookingTestCase, 'expectedErrors'>;
/** Case validation: expectedErrors bắt buộc, spec không cần kiểm tra undefined */
export type ValidationCase = FCL_BookingTestCase & { expectedErrors: ExpectedFieldError[] };

/** Dữ liệu tối thiểu hợp lệ, mọi case khác kế thừa từ đây */
const BASE_MANDATORY: FCLBookingData = {
    customer: CUSTOMER,
    type: ['Re-Export'],
    containerType: CONTAINER_TYPE,
    realWeight: 5,
    quantity: 1,
    ...PLACES,
};

/** Dữ liệu đầy đủ */
const BASE_VALID: FCLBookingData = {
    ...BASE_MANDATORY,
    projectName: 'Auto Test Project',
    sellingPrice: 1500000,
    bookingCustomer: 'BK-AUTO-001',
    customerPartnerName: 'Đối tác kiểm thử',
    releaseDatetime: getRelativeDatetime(1),
    shippingName: 'Hồ Anh Minh',
    sealNo: 'NO-75644337',
    shipper: 'Lê Khôi Nguyên',
    consignee: 'Hồ Anh Khang',
    receiptContact: 'Phan Mỹ Lệ',
    deliveryContact: 'Nguyễn Sỹ Hiệp'
};

/** Nền hợp lệ + ghi đè đúng thứ cần kiểm tra → mỗi case chỉ có một nguyên nhân lỗi */
const valid = makeValid(BASE_MANDATORY);

const blankOf = (f: (typeof REQUIRED_FIELDS)[number]): FCLBookingData =>
    ({ [f.key]: f.blankValue }) as FCLBookingData;

const BLANK_ALL: FCLBookingData = Object.assign({}, ...REQUIRED_FIELDS.map(blankOf));

const requiredErrors = (labels: string[]): ExpectedFieldError[] =>
    labels.map((label) => ({ label, message: MSG.required }));

// ═══════════════ 4. CASE THÊM MỚI THÀNH CÔNG ═══════════════
export const CREATE_SUCCESS_CASES: CreateCase[] = withIds<CreateCase>('CRE', [
    {
        description: 'Thêm mới đơn đặt hàng FCL thành công với các trường bắt buộc (kèm Note đánh dấu bản ghi)',
        severity: 'blocker',
        story: 'Happy Path - Mandatory Fields Only',
        tags: ['@smoke', '@regression'],
        data: { ...BASE_MANDATORY },
    },
    {
        description: 'Thêm mới đơn đặt hàng FCL thành công với đầy đủ các trường',
        severity: 'critical',
        story: 'Happy Path - Full Fields',
        tags: ['@regression'],
        data: { ...BASE_VALID },
    },
]).map((c) => ({ ...c, data: withUniqueNote(c.data) })); // mỗi case thành công có note riêng

// ═══════════════ 5. CASE VALIDATION ═══════════════

// 5.1 Bắt buộc: bỏ trống từng field (sinh từ REQUIRED_FIELDS)
const REQUIRED_CASES: Omit<ValidationCase, 'id'>[] = [
    {
        description: 'Bỏ trống tất cả các trường bắt buộc',
        severity: 'critical',
        story: 'Negative - All Mandatory Fields Empty',
        tags: ['@negative', '@validation'],
        data: { ...BLANK_ALL },
        expectedErrors: requiredErrors(REQUIRED_FIELDS.map((c) => c.label)),
    },
    ...REQUIRED_FIELDS.map((f): Omit<ValidationCase, 'id'> => ({
        description: `Bỏ trống riêng trường bắt buộc ${f.label}`,
        severity: 'critical',
        story: 'Negative - Missing Single Mandatory Field',
        tags: ['@negative', '@validation'],
        data: valid(blankOf(f)),
        expectedErrors: requiredErrors([f.label]),
    })),
];

// 5.2 Giá trị số: một dòng = một case. Thêm field/giá trị mới chỉ tốn một dòng.
// Lấy đại diện -1 (cùng nhánh logic); giữ thêm 0 ở field có thể là rule "> 0" hay ">= 0".
const NUMERIC_BOUNDARY: { key: keyof FCLBookingData; label: string; value: number; desc: string; message: string }[] = [
    { key: 'realWeight', label: 'Gross weight (Tons)', value: 0, desc: 'bằng 0', message: MSG.required },
];

const NUMERIC_CASES = NUMERIC_BOUNDARY.map((n): Omit<ValidationCase, 'id'> => ({
    description: `${n.label} ${n.desc}`,
    severity: 'normal',
    story: 'Negative - Boundary Value',
    tags: ['@negative', '@business-logic'],
    data: valid({ [n.key]: n.value }),
    expectedErrors: [{ label: n.label, message: n.message }],
}));

// 5.3 Nghiệp vụ liên field: mỗi RULE một case (không cần chiều ngược lại của cùng một rule)
const BUSINESS_CASES: Omit<ValidationCase, 'id'>[] = [
    {
        description: 'Nhập Selling Price nhưng bỏ trống Currency',
        severity: 'normal',
        story: 'Negative - Selling Price Without Currency',
        tags: ['@negative', '@business-logic'],
        data: valid({ sellingPrice: 100, currency: '' }),
        expectedErrors: [{ label: 'Currency', message: MSG.required }],
    },
    {
        description: 'Pickup Date nhỏ hơn Booking Date',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ bookingDate: getCurrentDate(), pickupDate: getRelativeDate(-1) }),
        expectedErrors: [{ label: 'Pickup Date', message: MSG.pickupGteBooking }],
    },
    {
        description: 'Receipt Datetime(empty/full) lớn hơn ETA Datetime',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ receiptDatetime: getRelativeDatetime(1), eTADatetime: getCurrentDatetime() }),
        expectedErrors: [{ label: 'Receipt Datetime(empty/full)', message: MSG.receiptLteEta }],
    },
    {
        description: 'ETD Datetime nhỏ hơn Receipt Datetime(empty/full)',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ receiptDatetime: getCurrentDatetime(), eTDDatetime: getRelativeDatetime(-1) }),
        expectedErrors: [{ label: 'ETD Datetime', message: MSG.etdRange }],
    },
    {
        description: 'ETD Datetime lớn hơn ETA Datetime',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ eTDDatetime: getRelativeDatetime(1), eTADatetime: getCurrentDatetime() }),
        expectedErrors: [{ label: 'ETD Datetime', message: MSG.etdRange }],
    },
    {
        description: 'ETA Datetime nhỏ hơn ETD Datetime',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ eTDDatetime: getCurrentDatetime(), eTADatetime: getRelativeDatetime(-1) }),
        expectedErrors: [{ label: 'ETA Datetime', message: MSG.etaRange }],
    },
    {
        description: 'ETA Datetime lớn hơn Delivery/Return Date',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ eTADatetime: getRelativeDatetime(1), deliveryReturnDate: getCurrentDate() }),
        expectedErrors: [{ label: 'ETA Datetime', message: MSG.etaRange }],
    },
    {
        description: 'Delivery/Return Date nhỏ hơn Pickup Date',
        severity: 'normal',
        story: 'Negative - Cross Field Rule',
        tags: ['@negative', '@business-logic'],
        data: valid({ pickupDate: getCurrentDate(), deliveryReturnDate: getRelativeDate(-1) }),
        expectedErrors: [{ label: 'Delivery/Return Date', message: MSG.returnGtePickup }],
    },
];

export const VALIDATION_CASES: ValidationCase[] = withIds<ValidationCase>('VAL', [
    ...REQUIRED_CASES,
    ...NUMERIC_CASES,
    ...BUSINESS_CASES,
]).map((c) => ({ ...c, data: withUniqueNote(c.data) })); // note riêng mỗi case: tìm lại và dọn nếu hệ thống lỡ lưu