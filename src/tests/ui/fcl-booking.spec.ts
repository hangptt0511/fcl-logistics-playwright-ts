import { trackCreated } from '@utils/cleanup.util';
import { CREATE_SUCCESS_CASES, VALIDATION_CASES } from '../data/fcl-booking';
import { DOMAIN_EPIC, FCL_GLOSSARY, FCL_BOOKING_UI_SCOPE } from '../data/annotations';
import { test } from '@fixtures/combined.fixture';

/**
 * Nhóm 1: Thêm mới thành công.
 * Mỗi case chạy theo 5 bước: tạo qua UI -> xác nhận đã lưu -> tìm lại qua API
 * -> đăng ký dọn dẹp -> đối chiếu dữ liệu trên danh sách, modal Detail, modal Edit.
 */
test.describe('FCL Booking - Thêm mới thành công', {
    // tag ở cấp nhóm: lọc theo tầng (--grep @ui). Tag riêng của từng case nằm ở item.tags
    tag: ['@ui'],
    annotation: [
        DOMAIN_EPIC,
        { type: 'Feature', description: 'FCL Booking' },
        { type: 'Mục tiêu', description: 'Nhập dữ liệu hợp lệ thì tạo được đơn đặt hàng FCL, dữ liệu hiển thị đúng ở danh sách, modal Detail và modal Edit.' },
        { type: 'Luồng nghiệp vụ', description: 'Thêm mới đơn đặt hàng → Nhập dữ liệu → Lưu → Kiểm tra danh sách / Detail / Edit' },
        FCL_BOOKING_UI_SCOPE,
        FCL_GLOSSARY,
    ],
}, () => {
    for (const item of CREATE_SUCCESS_CASES) {
        test(`${item.id} - ${item.description}`,
            // tag dùng để lọc khi chạy (--grep @smoke); annotation hiển thị Story trong report
            { tag: item.tags, annotation: [{ type: 'Story', description: item.story }, { type: 'Severity', description: item.severity },], },
            async ({ fclBooking, fclBookingApi, registerCreatedId }) => {
                // Mở menu 'FCL Booking'
                await fclBooking.page.goto();
                // Nhấn 'Add New Booking', nhập dữ liệu, nhấn 'Save'
                const resolved = await fclBooking.page.addNewBooking(item.data);
                // Kiểm tra "Save thành công" (toast)
                //await fclBooking.validator.expectSaveSuccess(fclBooking.page.loaderImg);
                // Đọc lại bản ghi vừa tạo để lấy id (cleanup) và mã
                const booking = await trackCreated({
                    label: 'đơn đặt hàng (theo Note)',
                    find: () => fclBookingApi.validator.getIdReadBackConfig(
                        resolved,
                        fclBookingApi.validator.buildReadBackConfig(),
                    ),
                    register: registerCreatedId,
                    cleanup: { service: fclBookingApi.service, action: 'delete' },
                    requireCode: true,
                });
                // Ghép mã booking do server sinh vào data kỳ vọng.
                // Validator dùng `code` để tìm đúng dòng trên danh sách.
                const created = { ...resolved, code: booking.code };
                // Kiểm tra dữ liệu hiển thị trên UI ở 3 nơi (soft: một lần chạy thấy đủ sai lệch).
                await fclBooking.validator.expectRowInTable(created);   // dòng trên danh sách
                await fclBooking.validator.expectDetailView(created);   // modal Detail
                await fclBooking.validator.expectEditView(created);     // modal Edit
            });
    }
});

/**
 * Nhóm 2: Validation.
 * Mỗi case chỉ có 1 nguyên nhân lỗi; kỳ vọng: UI báo đúng lỗi và Save bị chặn.
 */
test.describe('FCL Booking - Validation', {
    tag: ['@ui'],
    annotation: [
        DOMAIN_EPIC,
        { type: 'Feature', description: 'FCL Booking' },
        { type: 'Mục tiêu', description: 'Nhập thiếu trường bắt buộc hoặc giá trị không hợp lệ thì UI báo đúng lỗi và không cho lưu.' },
        { type: 'Luồng nghiệp vụ', description: 'Thêm mới đơn đặt hàng → Nhập dữ liệu sai → Lưu → UI báo lỗi, modal Add vẫn mở' },
        FCL_BOOKING_UI_SCOPE,
        FCL_GLOSSARY,
    ],
}, () => {
    for (const item of VALIDATION_CASES) {
        test(`${item.id} - ${item.description}`,
            { tag: item.tags },
            async ({ fclBooking, fclBookingApi, registerCreatedId }) => {
                // Mở menu 'FCL Booking'
                await fclBooking.page.goto();
                // Điền form và bấm Save, thu thập các lỗi đang hiện trên form
                const actual = await fclBooking.page.submitInvalidBooking(item.data);
                // Modal Add đã đóng nghĩa là Save lỡ thành công (bug).
                // Đọc lại bản ghi vừa tạo để lấy id (cleanup)
                if (!(await fclBooking.page.isAddModalOpen())) {
                    await trackCreated({
                        label: `đơn đặt hàng (theo Note))`,
                        find: () => fclBookingApi.validator.getIdReadBackConfig(
                            item.data,
                            fclBookingApi.validator.buildReadBackConfig(),
                        ),
                        register: registerCreatedId,
                        cleanup: { service: fclBookingApi.service, action: 'delete' },
                    });
                }
                const errorCountBefore = test.info().errors.length;
                // So sánh lỗi thực tế với kỳ vọng: thiếu, thừa hoặc sai nội dung đều được báo.
                await fclBooking.validator.expectFieldErrors(actual, item.expectedErrors);
                // Lỗi so sánh đã được ghi nhận: dừng, không chạy expectSaveBlocked
                if (test.info().errors.length > errorCountBefore) return;
                // Save bị chặn: modal Add vẫn mở và không có toast thành công.
                await fclBooking.validator.expectSaveBlocked();
            });
    }
});