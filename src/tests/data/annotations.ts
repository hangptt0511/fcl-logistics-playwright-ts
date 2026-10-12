/** Kiểu annotation của Playwright, khai báo để mảng dùng lại không bị lỗi kiểu readonly */
type Annotation = { type: string; description?: string };

// ── Dùng chung ──
export const DOMAIN_EPIC: Annotation = {
    type: 'Epic',
    description: 'Logistics Domain',
};

export const FCL_GLOSSARY: Annotation = {
    type: 'Thuật ngữ',
    description:
        'FCL = hàng nguyên container | Giá mua = giá nhà cung cấp báo | ' +
        'Bảng phân tích = tính giá bán + lợi nhuận | Bảng giá = giá áp dụng cho khách | ' +
        'Đơn đặt hàng = sinh ra khi chuyển đổi từ bảng giá',
};

// ── Test UI FCL Booking ──
export const FCL_BOOKING_UI_SCOPE: Annotation = {
    type: 'Phạm vi',
    description: 'Kiểm thử trên giao diện. Không gồm đối chiếu giá theo bảng phân tích (thuộc test E2E).',
};

// ── Test E2E: FCL Buying -> FCL Booking ──
export const FCL_BUYING_TO_BOOKING_E2E: Annotation[] = [
    DOMAIN_EPIC,
    { type: 'Feature', description: 'FCL Buying -> FCL Booking' },
    { type: 'Mục tiêu', description: 'Giá mua FCL đã duyệt chuyển được thành đơn đặt hàng FCL qua bảng phân tích và bảng giá.' },
    { type: 'Luồng nghiệp vụ', description: 'Giá mua [duyệt] → Bảng phân tích → Bảng giá [duyệt] → Đơn đặt hàng' },
    FCL_GLOSSARY,
];

// ── Test API: FCL Buying ──
export const PRICE_FCL_BUYING_CREATE_API: Annotation[] = [
    DOMAIN_EPIC,
    { type: 'Feature', description: 'FCL Buying' },
    { type: 'Mục tiêu', description: 'API tạo giá mua FCL trả đúng status và message theo từng điều kiện đầu vào; bản ghi tạo thành công đọc lại đúng dữ liệu.' },
    { type: 'Phạm vi', description: 'Kiểm thử ở tầng API, không qua giao diện.' },
    FCL_GLOSSARY,
];

export const PRICE_FCL_BUYING_DUPLICATE_API: Annotation[] = [
    DOMAIN_EPIC,
    { type: 'Feature', description: 'FCL Buying' },
    { type: 'Mục tiêu', description: 'Tạo trùng giá mua FCL bị chặn (400) và message lỗi nêu đúng mã của bản ghi đã tồn tại.' },
    { type: 'Phạm vi', description: 'Kiểm thử ở tầng API, không qua giao diện.' },
    FCL_GLOSSARY,
];

// ── Test API: Price Toll Buying ──
export const PRICE_TOOL_BUYING_CREATE_API: Annotation[] = [
    DOMAIN_EPIC,
    { type: 'Feature', description: 'Price Toll Buying' },
    { type: 'Mục tiêu', description: 'API tạo giá vé cầu đường trả đúng status và message theo từng điều kiện đầu vào; bản ghi tạo thành công đọc lại đúng dữ liệu.' },
    { type: 'Phạm vi', description: 'Kiểm thử ở tầng API, không qua giao diện.' },
    FCL_GLOSSARY,
];

export const PRICE_TOOL_BUYING_DUPLICATE_API: Annotation[] = [
    DOMAIN_EPIC,
    { type: 'Feature', description: 'Price Toll Buying' },
    { type: 'Mục tiêu', description: 'Tạo trùng giá vé cầu đường bị chặn (400) và message lỗi nêu đúng mã của bản ghi đã tồn tại.' },
    { type: 'Phạm vi', description: 'Kiểm thử ở tầng API, không qua giao diện.' },
    FCL_GLOSSARY,
];