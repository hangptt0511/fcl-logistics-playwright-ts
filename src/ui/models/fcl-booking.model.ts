import { FlexibleColumnMap } from '@utils/verification/data-verification';

/**
 * Đầu vào cho form: Mọi field đều optional, kể cả field bắt buộc trên UI.
 * Cho phép viết case "bỏ trống field X" bằng { x: undefined } hoặc { x: '' }.
 * Quy ước:
 *  - undefined     : không thao tác (field có mặc định thì giữ mặc định)
 *  - '' hoặc []    : cố tình xóa giá trị (kể cả giá trị mặc định) để test bắt buộc
 *  - giá trị khác  : nhập vào, ghi đè mặc định
 * Dùng làm kiểu trả về sau khi tạo thành công, và làm tham số cho các hàm verify
 * (table, detail modal, edit modal)
 */
export interface FCLBookingData {
    bookingDate?: string,
    serviceType?: string,          // 'Transportation' | ...
    projectName?: string,
    sellingPrice?: number,
    currency?: string,
    customer?: string,               // Short Name
    bookingCustomer?: string,
    bookingPerson?: string,
    customerPartnerName?: string,
    type?: string[],
    modeOfTransportName?: string[],
    containerType?: string,
    quantity?: number,
    realWeight?: number,
    commodityDescription?: string,
    pickupDate?: string,
    receiptDatetime?: string,
    eTDDatetime?: string,
    eTADatetime?: string,
    loadingUnloadingDatetime?: string,
    deliveryReturnDate?: string,
    closingTime?: string,
    releaseDatetime?: string,
    remark?: string,
    placeFrom?: string,
    placeOfReceipt?: string,
    placeOfLoading?: string,
    placeTo?: string,
    placeOfLoadingUnloading?: string,
    placeOfDischarge?: string,
    placeOfReturn?: string,
    vatRate?: number,
    rateCardCode?: string,
    status?: string,
    shippingName?: string,
    sealNo?: string,
    shipper?: string,
    consignee?: string,
    receiptContact?: string,
    deliveryContact?: string,
    bookingType?: string,
}

export interface ExpectedFieldError {
    label: string,     // Tên field hiển thị trên UI (khớp getName())
    message: string,
}

export interface FCL_BookingTestCase {
    id: string,
    description: string,
    severity: 'blocker' | 'critical' | 'normal' | 'minor',
    story: string,
    tags: string[],
    data: FCLBookingData,
    expectedErrors?: ExpectedFieldError[], // có: case negative, không có: case thành công
}

/** Cấu hình các field bắt buộc trên form FCL Booking (nguồn duy nhất) */
export interface RequiredFieldConfig {
    key: keyof FCLBookingData;    // gõ sai tên field sẽ báo lỗi compile
    label: string;                 // phải khớp getName() trên UI
    hasDefault?: boolean;          // UI tự điền sẵn giá trị mặc định
    blankValue?: unknown;          // giá trị để xóa trống (mặc định: undefined = không nhập)
}

export const REQUIRED_FIELDS: readonly RequiredFieldConfig[] = [
    { key: 'bookingDate', label: 'Booking Date', hasDefault: true, blankValue: '' },
    { key: 'customer', label: 'Customer' },
    { key: 'type', label: 'Type', blankValue: [] },
    { key: 'containerType', label: 'Container Type' },
    { key: 'modeOfTransportName', label: 'Mode Of Transport', hasDefault: true, blankValue: [] },
    { key: 'quantity', label: 'Quantity', hasDefault: true, blankValue: '' },
    { key: 'realWeight', label: 'Gross weight (Tons)' },
    { key: 'pickupDate', label: 'Pickup Date', hasDefault: true, blankValue: '' },
    { key: 'receiptDatetime', label: 'Receipt Datetime(empty/full)', hasDefault: true, blankValue: '' },
    { key: 'placeFrom', label: 'Place From' },
    { key: 'placeOfReceipt', label: 'Place Of Receipt(emty/full)' },
    { key: 'placeOfLoading', label: 'Place Of Loading' },
    { key: 'placeTo', label: 'Place To' },
    { key: 'placeOfLoadingUnloading', label: 'Place of Loading/Unloading' },
    { key: 'placeOfDischarge', label: 'Place Of Discharge' },
    { key: 'placeOfReturn', label: 'Place of Return(full/empty)' },
];

/** Field bắt buộc KHÔNG có mặc định: data của case thành công phải có đủ */
export const REQUIRED_KEYS_NO_DEFAULT: Array<keyof FCLBookingData> =
    REQUIRED_FIELDS.filter((f) => !f.hasDefault).map((f) => f.key);

export const TableColumnMap: FlexibleColumnMap<FCLBookingData> = {
    'Service Type': 'serviceType',
    'Booking Type': 'bookingType',
    'Booking Date': 'bookingDate',
    'Execution Date': 'pickupDate',
    'Customer': 'customer',
    'Customer Booking/SO No': 'bookingCustomer',
    'Type(Import/Export)': 'type',
    'Vehicle Type/ Container Type': 'containerType',
    'Quantity': { key: 'quantity', format: 'decimal' },
    'Place From': 'placeFrom',
    'Place Of Receipt(emty/full)': 'placeOfReceipt',
    'Place of Loading/Unloading': 'placeOfLoadingUnloading',
    'Place of Return(full/empty)': 'placeOfReturn',
    'Place To': 'placeTo',
    'Rate Card': 'rateCardCode',
    'Status': 'status',
    'Note': 'remark',
};

export const DetailFormColumnMap: FlexibleColumnMap<FCLBookingData> = {
    'Service Type': 'serviceType',
    'Booking Type': 'bookingType',
    'Booking Date': 'bookingDate',
    'Status': 'status',
    'Project Name': 'projectName',
    'Customer': 'customer',
    'Customer Of Customer': 'customerPartnerName',
    'Customer Booking': 'bookingCustomer',
    'Currency': 'currency',
    'Volume': { key: 'quantity', format: 'decimal' },
    'Gross weight (Tons)': { key: 'realWeight', format: 'decimal' },
    'VAT Rate': 'vatRate',
    'Type': 'type',
    'Mode Of Transport': 'modeOfTransportName',
    'Container Type': 'containerType',
    'Pickup Date': 'pickupDate',
    'Receipt Datetime(empty/full)': { key: 'receiptDatetime', format: 'date' },
    'ETD Datetime': { key: 'eTDDatetime', format: 'date' },
    'ETA Datetime': { key: 'eTADatetime', format: 'date' },
    'Delivery/Return Date': { key: 'deliveryReturnDate', format: 'date' },
    'Release Datetime': { key: 'releaseDatetime', format: 'date' },
    'Closing Time': 'closingTime',
    'Loading/Unloading Datetime': { key: 'loadingUnloadingDatetime', format: 'date' },
    'Note': 'remark',
    'Place From': 'placeFrom',
    'Place Of Loading (Station)': 'placeOfLoading',
    'Place Of Receipt': 'placeOfReceipt',
    'Place To': 'placeTo',
    'Place Of Discharge': 'placeOfDischarge',
    'Place of Loading/Unloading': 'placeOfLoadingUnloading',
    'Shipper': 'shipper',
    'Consignee': 'consignee',
    'Receipt Contact': 'receiptContact',
    'Delivery Contact': 'deliveryContact'
};

export const EditFormColumnMap: FlexibleColumnMap<FCLBookingData> = {
    'Booking Date': 'bookingDate',
    'Booking Type': 'bookingType',
    'Service Type': 'serviceType',
    'Selling Price':{ key: 'sellingPrice', format: 'integer' },
    'Currency': 'currency',
    'Project Name': 'projectName',
    'Note': 'remark',
    'Customer': 'customer',
    'Customer\'s Booking': 'bookingCustomer',
    'Customer Of Customer': 'customerPartnerName',
    'Type': 'type',
    'Container Type': 'containerType',
    'Mode Of Transport': 'modeOfTransportName',
    'Quantity': 'quantity',
    'Gross weight (Tons)': 'realWeight',
    'Pickup Date': 'pickupDate',
    'Receipt Datetime(empty/full)': 'receiptDatetime',
    'ETD Datetime': 'eTDDatetime',
    'ETA Datetime': 'eTADatetime',
    'Loading/Unloading Datetime': 'loadingUnloadingDatetime',
    'Delivery/Return Date': 'deliveryReturnDate',
    'Closing Time': 'closingTime',
    'Release Datetime': 'releaseDatetime',
    'Booking Person': 'bookingPerson',
    'VAT Rate': 'vatRate',
    'Seal No': 'sealNo',
    'Place From': 'placeFrom',
    'Place Of Receipt(emty/full)': 'placeOfReceipt',
    'Place Of Loading': 'placeOfLoading',
    'Place To': 'placeTo',
    'Place of Loading/Unloading': 'placeOfLoadingUnloading',
    'Place Of Discharge': 'placeOfDischarge',
    'Place of Return(full/empty)': 'placeOfReturn',
    'Shipper': 'shipper',
    'Consignee': 'consignee',
    'Receipt Contact': 'receiptContact',
    'Delivery Contact': 'deliveryContact'
};