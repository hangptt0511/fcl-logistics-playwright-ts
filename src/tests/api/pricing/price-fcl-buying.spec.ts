import { test } from "@fixtures/api.fixture";
import { PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES, PRICE_FCL_BUYING_CREATE_TEST_CASES } from "../../data/price-fcl-buying";
import { PRICE_FCL_BUYING_CREATE_API, PRICE_FCL_BUYING_DUPLICATE_API } from "../../data/annotations";

test.describe('PriceFCLBuying API - Tạo mới', {
    tag: ['@api'],
    annotation: PRICE_FCL_BUYING_CREATE_API,
}, () => {
    for (const item of PRICE_FCL_BUYING_CREATE_TEST_CASES) {
        test(`${item.id} - ${item.description}`,
            // tag dùng để lọc khi chạy (--grep @smoke); annotation hiển thị Story trong report
            { tag: item.tags, annotation: [{ type: 'Story', description: item.story }, { type: 'Severity', description: item.severity },], },
            async ({ priceFCLBuyingApi, registerCreatedId }) => {

                // Đính kèm Request Payload vào Playwright
                await test.info().attach('Payload_FCLBuying.json', {
                    body: JSON.stringify(item.payload, null, 2),
                    contentType: 'application/json',
                });
                // Gọi API tạo mới giá mua
                const response = await priceFCLBuyingApi.service.create(item.payload);
                // Kiểm tra
                const { createdId } = await priceFCLBuyingApi.validator.verifyTestCase(response, item);
                // Đăng ký id (cleanup)
                if (createdId) {
                    registerCreatedId(createdId, priceFCLBuyingApi.service, 'delete');
                }
            });

    }
});

test.describe('PriceFCLBuying API - Tạo mới', {
    tag: ['@api'],
    annotation: PRICE_FCL_BUYING_DUPLICATE_API,
}, () => {
    for (const item of PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES) {
        test(`${item.id} - ${item.description}`,
            // tag dùng để lọc khi chạy (--grep @smoke); annotation hiển thị Story trong report
            { tag: item.tags, annotation: [{ type: 'Story', description: item.story }, { type: 'Severity', description: item.severity },], },
            async ({ priceFCLBuyingApi, registerCreatedId }) => {

                // Đính kèm Request Payload vào Playwright
                await test.info().attach('Payload_FCLBuying.json', {
                    body: JSON.stringify(item.payload, null, 2),
                    contentType: 'application/json',
                });
                // Gọi API tạo mới giá mua lần 1
                const setupResponse = await priceFCLBuyingApi.service.create(item.payload);
                const { createdId: setupId, createdCode } = await priceFCLBuyingApi.validator.verifyTestCase(
                    setupResponse,
                    {
                        ...item,
                        expectedResponse: { status: 200, name: 'MSG_INSERT_SUCCESS', value: 'New data added' },
                    }
                );
                // Đăng ký cleanup ngay, phòng khi bước 2 fail giữa chừng
                if (setupId) {
                    registerCreatedId(setupId, priceFCLBuyingApi.service, 'delete');
                }

                // Đính kèm Request Payload vào Playwright
                await test.info().attach(`SetupCode_${item.id}.txt`, {
                    body: createdCode ?? '(không lấy được code)',
                    contentType: 'text/plain',
                });

                // Gọi API tạo mới giá mua lần 1 -> kỳ vọng bị chặn 400 duplicate
                const duplicateResponse = await priceFCLBuyingApi.service.create(item.payload);
                const { createdId: dupCreatedId } = await priceFCLBuyingApi.validator.verifyTestCase(
                    duplicateResponse,
                    item,
                    createdCode // truyền existingRecordCode để so khớp mã trong message lỗi
                );

                 // Đăng ký cleanup ngay, nếu lỗi tạo thành công
                if (dupCreatedId) {
                    registerCreatedId(dupCreatedId, priceFCLBuyingApi.service, 'delete');
                }
            });
    }
});