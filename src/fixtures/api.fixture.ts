import { test as base, request } from "@playwright/test";
import { ApiClient } from "@api/core/api-client";
import { PriceFCLBuyingService } from "@api/services/pricing/price-fcl-buying.service";
import { PriceFCLBuyingValidator } from "@api/validators/price-fcl-buying.validator";
import { PriceTollBuyingService } from "@api/services/pricing/price-toll-buying.service";
import { PriceTollBuyingValidator } from "@api/validators/price-toll-buying.validator";
import { FCLBookingService } from "@api/services/fcl-booking.service";
import { FCLBookingValidator } from "@api/validators/fcl-booking.validator";
import { FCLQuotationService } from "@api/services/fcl-quotation.service";
import { FCLQuotationValidator } from "@api/validators/fcl-quotation.validator";
import { FCLRateCardService } from "@api/services/pricing/fcl-rate-card.service";
import { FCLRateCardValidator } from "@api/validators/fcl-rate-card.validator";
import { logger } from "@utils/logger";
import { CleanupAction } from "@utils/cleanup.util";
import { Deletable, Register, Revokeable } from "@api/core/types";

const CLEANUP_NOTE = 'Auto cleanup';
/** Mỗi feature API gom service + validator vào một fixture, giống fixture UI ({ page, validator }) */
type ApiFeature<S, V> = { service: S; validator: V };

type ApiFixtures = {
    adminApiClient: ApiClient;
    registerCreatedId: Register;
    priceFCLBuyingApi: ApiFeature<PriceFCLBuyingService, PriceFCLBuyingValidator>;
    priceTollBuyingApi: ApiFeature<PriceTollBuyingService, PriceTollBuyingValidator>;
    fclBookingApi: ApiFeature<FCLBookingService, FCLBookingValidator>;
    fclQuotationApi: ApiFeature<FCLQuotationService, FCLQuotationValidator>;
    fclRateCardApi: ApiFeature<FCLRateCardService, FCLRateCardValidator>;
};

export const test = base.extend<ApiFixtures>({
    adminApiClient: async ({ }, use) => {
        const requestContext = await request.newContext({ baseURL: process.env.BASE_URL });
        const apiClient = new ApiClient(requestContext, 'admin');
        await use(apiClient);
        await requestContext.dispose();
    },

    /**
  * Cho phép test case đăng ký id vừa tạo kèm service tương ứng để tự động dọn dẹp
  * Dọn tuần tự theo thứ tự ngược với thứ tự đăng ký (con trước, cha sau); lệnh lỗi không chặn
  * các lệnh còn lại và được log lại để tránh rác dữ liệu âm thầm tồn đọng.
  */
    registerCreatedId: async ({ }, use) => {
        const createdItems: Array<{
            id: string;
            action: CleanupAction;
            run: () => Promise<unknown>;
        }> = [];

        const register: Register = (
            id: string | undefined,
            service: Deletable | Revokeable,
            action: CleanupAction = 'delete',
        ) => {
            if (!id) return;
            createdItems.push({
                id,
                action,
                run: () =>
                    action === 'revoke'
                        ? (service as Revokeable).revoke({ id, note: CLEANUP_NOTE })
                        : (service as Deletable).delete(id),
            });
        };

        await use(register);

        if (createdItems.length === 0) return;

        // LIFO: bản ghi sinh sau (con) dọn trước, sinh trước (cha) dọn sau.
        // Tuần tự vì các bản ghi phụ thuộc nhau; một lệnh lỗi không chặn các lệnh còn lại.
        const failedItems: Array<{ id: string; action: CleanupAction }> = [];
        for (const { id, action, run } of [...createdItems].reverse()) {
            try {
                await run();
            } catch (error) {
                failedItems.push({ id, action });
                logger.warn(`Cleanup (${action}) bản ghi thất bại`, { id, action, error: String(error) });
            }
        }
        if (failedItems.length > 0) {
            logger.warn('Cleanup thất bại - còn bản ghi chưa dọn được', { failedItems });
        }
    },

    priceFCLBuyingApi: async ({ adminApiClient }, use) => {
        const service = new PriceFCLBuyingService(adminApiClient);
        await use({ service, validator: new PriceFCLBuyingValidator(service) });
    },

    priceTollBuyingApi: async ({ adminApiClient }, use) => {
        const service = new PriceTollBuyingService(adminApiClient);
        await use({ service, validator: new PriceTollBuyingValidator(service) });
    },

    fclBookingApi: async ({ adminApiClient }, use) => {
        const service = new FCLBookingService(adminApiClient);
        await use({ service, validator: new FCLBookingValidator(service) });
    },

    fclQuotationApi: async ({ adminApiClient }, use) => {
        const service = new FCLQuotationService(adminApiClient);
        await use({ service, validator: new FCLQuotationValidator(service) });
    },
    fclRateCardApi: async ({ adminApiClient }, use) => {
        const service = new FCLRateCardService(adminApiClient);
        await use({ service, validator: new FCLRateCardValidator(service) });
    },
});

export { expect } from "@playwright/test";