import { test } from "@fixtures/api.fixture";
import { PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES, PRICE_TOLL_BUYING_CREATE_TEST_CASES } from "../../data/price-toll-buying";
import { PRICE_TOOL_BUYING_CREATE_API, PRICE_TOOL_BUYING_DUPLICATE_API } from "../../data/annotations";

test.describe('PriceToolBuying API - Tạo mới', {
    tag: ['@api'],
    annotation: PRICE_TOOL_BUYING_CREATE_API,
}, () => {
    for (const item of PRICE_TOLL_BUYING_CREATE_TEST_CASES) {
        test(`${item.id} - ${item.description}`,
            // tag dùng để lọc khi chạy (--grep @smoke); annotation hiển thị Story trong report
            { tag: item.tags, annotation: [{ type: 'Story', description: item.story }, { type: 'Severity', description: item.severity },], },
            async ({ priceTollBuyingApi, registerCreatedId }) => {

                // Đính kèm Request Payload vào Playwright
                await test.info().attach('Payload_FCLBuying.json', {
                    body: JSON.stringify(item.payload, null, 2),
                    contentType: 'application/json',
                });
                // Gọi API tạo mới giá vé cầu đường
                const response = await priceTollBuyingApi.service.create(item.payload);
                // Kiểm tra
                const { createdId } = await priceTollBuyingApi.validator.verifyTestCase(response, item);
                // Đăng ký id (cleanup)
                if (createdId) {
                    registerCreatedId(createdId, priceTollBuyingApi.service, 'delete');
                }
            });

    }
});

test.describe('PriceToolBuying API - Tạo mới', {
    tag: ['@api'],
    annotation: PRICE_TOOL_BUYING_DUPLICATE_API,
}, () => {
    for (const item of PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES) {
        test(`${item.id} - ${item.description}`,
            // tag dùng để lọc khi chạy (--grep @smoke); annotation hiển thị Story trong report
            { tag: item.tags, annotation: [{ type: 'Story', description: item.story }, { type: 'Severity', description: item.severity },], },
            async ({ priceTollBuyingApi, registerCreatedId }) => {

                // Đính kèm Request Payload vào Playwright
                await test.info().attach('Payload_FCLBuying.json', {
                    body: JSON.stringify(item.payload, null, 2),
                    contentType: 'application/json',
                });
                // Gọi API tạo mới giá mua lần 1
                const setupResponse = await priceTollBuyingApi.service.create(item.payload);
                const { createdId: setupId, createdCode } = await priceTollBuyingApi.validator.verifyTestCase(
                    setupResponse,
                    {
                        ...item,
                        expectedResponse: { status: 200, message: 'New data added' },
                    }
                );
                // Đăng ký cleanup ngay, phòng khi bước 2 fail giữa chừng
                if (setupId) {
                    registerCreatedId(setupId, priceTollBuyingApi.service, 'delete');
                }

                // Đính kèm Request Payload vào Playwright
                await test.info().attach(`SetupCode_${item.id}.txt`, {
                    body: createdCode ?? '(không lấy được code)',
                    contentType: 'text/plain',
                });

                // Gọi API tạo mới giá mua lần 1 -> kỳ vọng bị chặn 400 duplicate
                const duplicateResponse = await priceTollBuyingApi.service.create(item.payload);
                const { createdId: dupCreatedId } = await priceTollBuyingApi.validator.verifyTestCase(
                    duplicateResponse,
                    item,
                    createdCode // truyền existingRecordCode để so khớp mã trong message lỗi
                );

                // Đăng ký cleanup ngay, nếu lỗi tạo thành công
                if (dupCreatedId) {
                    registerCreatedId(dupCreatedId, priceTollBuyingApi.service, 'delete');
                }
            });
    }
});