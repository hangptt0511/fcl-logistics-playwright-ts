import {
    buildPriceFclBuyingPayload, EXPECTED_BOOKING,
    buildConvertBookingData,
    EXPECTED_QUOTATION,
    EXPECTED_CREATE_QUOTATION,
    buildRateCardData,
    buildFCLQuotationData,
    EXPECTED_RATE_CARD,
} from '../data/convert-booking-to-buying';
import { FCL_BUYING_TO_BOOKING_E2E } from '../data/annotations';
import { test } from '@fixtures/combined.fixture';
import { trackCreated } from '@utils/cleanup.util';

/** E2E giá mua FCL -> đơn đặt hàng FCL. Mô tả nghiệp vụ xem FCL_BUYING_TO_BOOKING_E2E. */
test('Chuyển đổi giá mua FCL thành đơn đặt hàng FCL',
    {
        tag: ['@e2e', '@regression'],
        annotation: FCL_BUYING_TO_BOOKING_E2E,
    },
    async ({
        priceFCLBuyingApi, fclBookingApi, registerCreatedId, fclQuotationApi, fclRateCardApi,
        fclBuying, fclQuotationList, fclRateCard, fclBooking, createFCLQuotation
    }) => {
        // Luồng dài, nhiều bước UI: nới timeout gấp ba lần thay vì tăng timeout toàn project
        test.slow();

        //── Giai đoạn 1: dữ liệu nguồn qua API ──
        const buyingPayload = await test.step('Tạo giá mua qua API', async () => {
            //Tạo mới mỗi lần chạy để payload có Note duy nhất
            const buyingPayload = buildPriceFclBuyingPayload();

            await test.info().attach('Payload_FCLBuying.json', {
                body: JSON.stringify(buyingPayload, null, 2),
                contentType: 'application/json',
            });
            //Tạo giá mua
            const response = await priceFCLBuyingApi.service.create(buyingPayload);
            //Kiểm tra status
            priceFCLBuyingApi.validator.assertStatusCode(response, 200);
            return buyingPayload;
        });

        // Đọc lại bản ghi vừa tạo để lấy id (cleanup) và mã
        const buying = await trackCreated({
            label: 'giá mua (theo Note)',
            find: () => priceFCLBuyingApi.validator.getIdReadBackConfig(
                buyingPayload,
                priceFCLBuyingApi.validator.buildReadBackConfig(),
            ),
            register: registerCreatedId,
            cleanup: { service: priceFCLBuyingApi.service, action: 'revoke' },
            requireCode: true,
        });

        await test.step('Gửi yêu cầu duyệt giá mua qua API', async () => {
            //Gửi yêu cầu duyệt giá mua
            const response = await priceFCLBuyingApi.service.sendRequest({ id: buying.id, action: 20 });
            //Kiểm tra status
            priceFCLBuyingApi.validator.assertStatusCode(response, 200);
        });

        await test.step('Duyệt yêu cầu duyệt giá mua qua API', async () => {
            //Duyệt yêu cầu giá mua
            const response = await priceFCLBuyingApi.service.approve({ id: buying.id, action: 21 });
            // Kiểm tra status
            priceFCLBuyingApi.validator.assertStatusCode(response, 200);
        });

        // ── Giai đoạn 2: nghiệp vụ qua UI ──
        await test.step('Kiểm tra dữ liệu từ giá mua đã duyệt sang Tạo nhanh bảng phân tích', async () => {
            //Mở menu 'FCL Buying'
            await fclBuying.page.goto();
            //Mở tab 'Accepted'
            await fclBuying.page.openTabAccepted();
            //Tìm dòng có mã giá mua, click 'Quickly create a Quotation', chuyển menu 'Create FCL Quotation'
            await fclBuying.page.openQuickCreateQuotation(buying.code);
            //Kiểm tra dữ liệu từ giá mua sang menu 'Create FCL Quotation'
            await fclBuying.validator.expectQuickCreateQuotationData({
                ...EXPECTED_CREATE_QUOTATION,
                code: buying.code
            });
        });
        // Tạo mới mỗi lần chạy để payload có Note duy nhất
        const quotationData = buildFCLQuotationData();

        //Nhập dữ liệu, nhấn 'Save'
        await test.step('Tạo bảng phân tích', () => createFCLQuotation.page.save(quotationData));

        //Kiểm tra "Save thành công" (toast)
        await createFCLQuotation.validator.expectSaveSuccess(createFCLQuotation.page.successMsg);

        await test.step('Kiểm tra câu hỏi xác nhận và Cancel', async () => {
            //Kiểm tra popup xác nhận có muốn tiếp tục tạo mới bảng phân tích
            await createFCLQuotation.validator.expectCreateConfirmMessage();
            //Click 'Cancel', chuyển menu 'FCL Quotation List'
            await createFCLQuotation.page.confirmDialog.cancel();
        });

        // Đọc lại bản ghi vừa tạo để lấy id (cleanup) và mã
        const quotation = await trackCreated({
            label: 'bảng phân tích (theo Note)',
            find: () => fclQuotationApi.validator.getIdReadBackConfig(
                quotationData,
                fclQuotationApi.validator.buildReadBackConfig(),
            ),
            register: registerCreatedId,
            cleanup: { service: fclQuotationApi.service, action: 'revoke' },
            requireCode: true,
        });

        await test.step('Kiểm tra dữ liệu bảng phân tích trên danh sách tab Accepted (đúng Customer, Type, Final Price, Profit, Status)', async () => {
            //Mở menu 'FCL Quotation List'
            await fclQuotationList.page.goto();
            //Click tab 'Accepted'
            await fclQuotationList.page.clickTab('Accepted');
            //Tìm dòng có mã bảng phân tích, kiểm tra dữ liệu dòng trên bảng
            await fclQuotationList.validator.expectRowInTable({
                ...EXPECTED_QUOTATION,
                code: quotation.code,
            });
        });

        const { rateCardCode, rateCardData } = await test.step('Tạo bảng giá từ bảng phân tích', async () => {
            //Mở menu 'FCL Rate Card'
            await fclRateCard.page.goto();
            // Tạo mới mỗi lần chạy để payload có Rate Card Name duy nhất
            const rateCardData = buildRateCardData();
            //Click 'Add New Rate Card', chọn 'Customer', chọn mã bảng phân tích, click 'Next', nhập dữ liệu, click 'Save'
            const rateCardCode = await fclRateCard.page.addNewRateCard(
                {
                    ...rateCardData,
                    quotationCode: quotation.code
                });
            return { rateCardCode, rateCardData };
        });

        //Kiểm tra "Save thành công" (toast)
        await fclRateCard.validator.expectSaveRateCardSuccess(rateCardCode);

        // Đọc lại bản ghi vừa tạo để lấy id (cleanup) và mã
        await trackCreated({
            label: 'bảng giá (theo Rate Card Name)',
            find: () => fclRateCardApi.validator.getIdReadBackConfig(
                rateCardData,
                fclRateCardApi.validator.buildReadBackConfig(),
            ),
            register: registerCreatedId,
            cleanup: { service: fclRateCardApi.service, action: 'revoke' },
        });

        await test.step('Kiểm tra dữ liệu bảng giá trên danh sách tab Updating (đúng Name, Customer, Contract No, Effected Date, Expired Date)', async () => {
            //Click tab 'Updating'
            await fclRateCard.page.clickTab('Updating');
            //Tìm dòng có mã bảng giá
            //Kiểm tra dữ liệu dòng trên bảng
            await fclRateCard.validator.expectRowInTable({
                ...EXPECTED_RATE_CARD,
                code: rateCardCode,
                rateCardName: rateCardData.rateCardName,
            });
        });

        //Tìm dòng có mã bảng giá, click 'Send Request', click 'Send Request' trong pop up 'Request Approval Rate Card'
        await test.step('Gửi yêu cầu duyệt bảng giá', () => fclRateCard.page.requestApproval(rateCardCode));

        //Kiểm tra "Send Request thành công" (toast)
        await fclRateCard.validator.expectRequestApprovalSuccess(rateCardCode);

        //Click tab 'Pending', tìm dòng có mã bảng giá, click 'Accept', click 'Accept' trong pop up 'Accept Rate Card'
        await test.step('Duyệt bảng giá', () => fclRateCard.page.accept(rateCardCode));

        // Kiểm tra "Accept thành công" (toast)
        await fclRateCard.validator.expectApproveSuccess();

        const convertBookingData = await test.step('Chuyển bảng giá thành đơn đặt hàng', async () => {
            // Tạo mới mỗi lần chạy để data có Note duy nhất
            const convertBookingData = buildConvertBookingData();
            //Click tab Allow Booking, tìm dòng có mã bảng giá, click 'Convert Booking', nhập dữ liệu, click 'Convert'
            await fclRateCard.page.convertBooking(rateCardCode, convertBookingData);
            return convertBookingData;
        });

        await test.step('Kiểm tra câu hỏi xác nhận và OK', async () => {
            //Kiểm tra popup xác nhận 'Convert'
            await fclRateCard.validator.expectConvertConfirmMessage();
            //Xác nhận 'Convert'
            await fclRateCard.page.confirmDialog.confirm();
        });

        //Kiểm tra "Convert Booking thành công" (toast)
        await fclRateCard.validator.expectConvertSuccess();

        // Đọc lại bản ghi vừa tạo để lấy id (cleanup) và mã
        const booking = await trackCreated({
            label: 'đơn đặt hàng (theo Note)',
            find: () => fclBookingApi.validator.getIdReadBackConfig(
                convertBookingData,
                fclBookingApi.validator.buildReadBackConfig(),
            ),
            register: registerCreatedId,
            cleanup: { service: fclBookingApi.service, action: 'delete' },
            requireCode: true,
        });

        await test.step('Kiểm tra dữ liệu đơn đặt hàng trên danh sách (đúng Customer, Type(Import/Export), Quantity, Rate Card, Status, Note)', async () => {
            //Mở menu 'FCL Booking'
            await fclBooking.page.goto();
            //Tìm dòng có mã đơn đặt hàng, kiểm tra dữ liệu dòng trên bảng
            await fclBooking.validator.expectRowInTable({
                ...EXPECTED_BOOKING,
                rateCardCode,
                code: booking.code,
                remark: convertBookingData.remark,
            });
        });
    });