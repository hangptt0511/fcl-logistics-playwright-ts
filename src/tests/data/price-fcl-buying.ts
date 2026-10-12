import { PriceFCLBuyingCreateTestCase, PriceFCLBuyingPayload } from "@api/models/price-fcl-buying.model";
import { omitField } from '@utils/data/payload.util';
import { uniqueNote } from "@utils/data/test-data.util";

const BASE_MANDATORY_PAYLOAD: PriceFCLBuyingPayload = {
    supplierId: "0316976133",
    placeFrom: "cc59e4fa-45cf-421c-acee-00f0cb4f40fb",
    placeTo: "d1fc33a9-f937-4ec0-8343-00083a424e98",
    serviceTypeId: 1,
    roadId: "Road",
    weightRangeId: 15,
    containerTypeId: "20DC",
    currencyId: "VND",
    price: 1500000,
    vatrate: 8,
    priceIncludedVat: 1620000,
};

const BASE_VALID_PAYLOAD: PriceFCLBuyingPayload = {
    ...BASE_MANDATORY_PAYLOAD,
    poReceiptId: "d1fc33a9-f937-4ec0-8343-00083a424e98",
    poTransferId: "3f66c52a-0d00-45b0-91f4-000a80622b2c",
    poDeliveryId: "a14690b7-c74c-4042-82b3-000f4c7df632",
    customerId: "00101407560",
    contractId: 5052,
    weekdays: "Monday",
    includeVat: false,
    projectName: "ABC",
    returnAssocFreightPecent: "1;1.2",
    canceledFreightPecent: "3.1",
    note: "Ghi chú",
    inactive: true,
    isDangerousGoods: true,
    isRefrigeratedGoods: true,
    effectiveOn: "2025-04-01",
    expiryOn: "2060-03-17",
};

/** Payload đầy đủ kèm Note riêng. Mỗi lần gọi ra một Note mới, dùng cho case có tạo bản ghi */
const buildValidPayload = (): PriceFCLBuyingPayload => ({
    ...BASE_VALID_PAYLOAD,
    note: uniqueNote(),
});

/** Payload chỉ gồm trường bắt buộc, kèm Note để đánh dấu và đọc lại bản ghi */
const buildMandatoryPayload = (): PriceFCLBuyingPayload => ({
    ...BASE_MANDATORY_PAYLOAD,
    note: uniqueNote(),
});

export const PRICE_FCL_BUYING_CREATE_TEST_CASES: PriceFCLBuyingCreateTestCase[] = [
    {
        id: 'TC_01',
        description: 'Tạo giá mua FCL thành công với đầy đủ tất cả các trường',
        severity: 'critical',
        story: 'Happy Path - Full Fields',
        tags: ['@smoke', '@regression'],
        payload:  buildValidPayload(),
        expectedResponse: {
            status: 200,
            name: 'MSG_INSERT_SUCCESS',
            value: 'New data added',
        }
    },
    {
        id: 'TC_02',
        description: 'Tạo giá mua FCL thành công với các trường bắt buộc (kèm Note đánh dấu bản ghi)',
        severity: 'critical',
        story: 'Happy Path - Mandatory Fields Only',
        tags: ['@smoke', '@regression'],
        payload:  buildMandatoryPayload(),
        expectedResponse: {
            status: 200,
            name: 'MSG_INSERT_SUCCESS',
            value: 'New data added',
        }
    },
    {
        id: 'TC_03',
        description: 'Bỏ trống Payload {}',
        severity: 'normal',
        story: 'Negative - Empty Payload',
        tags: ['@negative', '@validation'],
        payload: {},
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_04',
        description: 'Thiếu trường bắt buộc supplierId',
        severity: 'critical',
        story: 'Negative - Missing Mandatory Field',
        tags: ['@negative', '@validation'],
        payload: omitField(BASE_VALID_PAYLOAD, 'supplierId'),
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_05',
        description: 'Trường serviceTypeId sai kiểu dữ liệu (string thay vì number)',
        severity: 'normal',
        story: 'Negative - Invalid Data Type',
        tags: ['@negative', '@validation'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            serviceTypeId: 'abc',
        },
        expectedResponse: {
            status: 400,
            errorField: 'serviceTypeId',
        }
    },
    {
        id: 'TC_06',
        description: 'Trường effectiveOn sai định dạng (DD-YYYY thay vì YYYY-MM-DD)',
        severity: 'normal',
        story: 'Negative - Invalid Date Format',
        tags: ['@negative', '@validation'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            effectiveOn: '13-2025',
        },
        expectedResponse: {
            status: 400,
            errorField: 'effectiveOn',
        }
    },
    {
        id: 'TC_07',
        description: 'Trường returnAssocFreightPecent sai định dạng (dùng dấu "," cho số thập phân)',
        severity: 'normal',
        story: 'Negative - Pattern Validation Violation',
        tags: ['@negative', '@validation'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            returnAssocFreightPecent: '9,9;8',
        },
        expectedResponse: {
            status: 400,
            errorField: 'returnAssocFreightPecent',
        }
    },
    {
        id: 'TC_08',
        description: 'Trường price có giá trị âm',
        severity: 'normal',
        story: 'Negative - Business Rule Violation',
        tags: ['@negative', '@business-logic'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            price: -1500000,
        },
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_09',
        description: 'Trường supplierId hợp lệ nhưng không tồn tại trong hệ thống',
        severity: 'normal',
        story: 'Negative - Reference Not Found',
        tags: ['@negative', '@business-logic'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            supplierId: '9999999999',
        },
        expectedResponse: {
            status: 400
        }
    }
];

export const PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES: PriceFCLBuyingCreateTestCase[] = [
    {
        id: 'TC_10',
        description: 'Tạo giá mua FCL trùng với bản ghi đã tồn tại trong hệ thống',
        severity: 'critical',
        story: 'Negative - Duplicate Record',
        tags: ['@negative', '@business-logic'],
        payload: buildMandatoryPayload(),
        expectedResponse: {
            status: 400,
            verifyCodeMatchesExisting:true
        }
    },
];