import { PriceTollBuyingPayload, PriceTollBuyingCreateTestCase } from "@api/models/price-toll-buying.model";
import { omitField, omitNestedField } from '@utils/data/payload.util';

const BASE_MANDATORY_PAYLOAD: PriceTollBuyingPayload = {
    Master: {
        "botId": "0316976133",
        "currencyId": "VND",
        "vatrate": 8,
        "contractId": 5052,
        "vehicleTypeId": 13,
        "effectiveOn": "2025-04-01",
        "expiryOn": "2060-03-17",
        "includedVat": false,
        "price": 1500000,
        "priceVat": 1620000
    },
    Details: [
        {
            "vehicleId": 74
        },
        {
            "vehicleId": 77
        }
    ],
    Places: [
        {
            "placeId": "60681e57-754e-46b1-be22-d712ad8e4c24"
        },
        {
            "placeId": "1ac32d6c-e8b9-42ee-8ec8-e82f7c9aeeed"
        }
    ]
};

export const BASE_VALID_PAYLOAD: PriceTollBuyingPayload = {
    ...BASE_MANDATORY_PAYLOAD,
    Master: {
        ...BASE_MANDATORY_PAYLOAD.Master,
        note: "Ghi chú"
    }
};

export const PRICE_TOLL_BUYING_CREATE_TEST_CASES: PriceTollBuyingCreateTestCase[] = [
    {
        id: 'TC_01',
        description: 'Tạo giá vé cầu đường thành công với đầy đủ tất cả các trường',
        severity: 'critical',
        story: 'Happy Path - Full Fields',
        tags: ['@smoke', '@regression'],
        payload: { ...BASE_VALID_PAYLOAD },
        expectedResponse: {
            status: 200,
            message: 'New data added'
        }
    },
    {
        id: 'TC_02',
        description: 'Tạo giá vé cầu đường thành công với các trường bắt buộc',
        severity: 'critical',
        story: 'Happy Path - Mandatory Fields Only',
        tags: ['@smoke', '@regression'],
        payload: { ...BASE_MANDATORY_PAYLOAD },
        expectedResponse: {
            status: 200,
            message: 'New data added'
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
            status: 500
        }
    },
    {
        id: 'TC_04',
        description: 'Thiếu trường bắt buộc Master',
        severity: 'critical',
        story: 'Negative - Missing Mandatory Field',
        tags: ['@negative', '@validation'],
        payload: omitField(BASE_VALID_PAYLOAD, 'Master'),
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_05',
        description: 'Thiếu trường bắt buộc botId',
        severity: 'critical',
        story: 'Negative - Missing Mandatory Field',
        tags: ['@negative', '@validation'],
        payload: omitNestedField(BASE_VALID_PAYLOAD, 'Master', 'botId'),
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_06',
        description: 'Trường botId sai kiểu dữ liệu (string thay vì number)',
        severity: 'normal',
        story: 'Negative - Invalid Data Type',
        tags: ['@negative', '@validation'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            Master: {
                ...BASE_VALID_PAYLOAD.Master,
                botId: "abc"
            }
        },
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_07',
        description: 'Trường effectiveOn sai định dạng (DD-YYYY thay vì YYYY-MM-DD)',
        severity: 'normal',
        story: 'Negative - Invalid Date Format',
        tags: ['@negative', '@validation'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            Master: {
                ...BASE_VALID_PAYLOAD.Master,
                effectiveOn: '13-2025'
            }
        },
        expectedResponse: {
            status: 400,
            errorField: 'Master.effectiveOn',
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
            Master: {
                ...BASE_VALID_PAYLOAD.Master,
                price: -1500000
            }
        },
        expectedResponse: {
            status: 400
        }
    },
    {
        id: 'TC_09',
        description: 'Trường botId hợp lệ nhưng không tồn tại trong hệ thống',
        severity: 'normal',
        story: 'Negative - Reference Not Found',
        tags: ['@negative', '@business-logic'],
        payload: {
            ...BASE_VALID_PAYLOAD,
            Master: {
                ...BASE_VALID_PAYLOAD.Master,
                botId: "9999999999"
            }
        },
        expectedResponse: {
            status: 400
        }
    }
];

export const PRICE_FCL_BUYING_CREATE_DUPLICATE_TEST_CASES: PriceTollBuyingCreateTestCase[] = [
    {
        id: 'TC_10',
        description: 'Tạo giá vé cầu đường trùng với bản ghi đã tồn tại trong hệ thống',
        severity: 'critical',
        story: 'Negative - Duplicate Record',
        tags: ['@negative', '@business-logic'],
        payload: { ...BASE_VALID_PAYLOAD },
        expectedResponse: {
            status: 400,
            verifyCodeMatchesExisting: true
        }
    },
];