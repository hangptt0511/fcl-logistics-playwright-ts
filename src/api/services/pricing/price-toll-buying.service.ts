import { test } from '@playwright/test';
import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/price-toll-buying.model"
import { ApiResponse } from "@api/core/types";

export class PriceTollBuyingService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

    /**
    * Tìm kiếm theo bộ lọc
    */
    async search(params: Partial<MODELS.PriceTollBuyingSearchParams>): Promise<ApiResponse<MODELS.PriceTollBuyingSearchResponse>> {
        return await test.step('Gọi API tìm kiếm giá vé cầu đường', async () => {
            return await this.apiClient.get<MODELS.PriceTollBuyingSearchResponse>({
                url: ENDPOINTS.PRICE_TOLL_BUYING.LIST,
                params
            });
        });

    }

    /**
    * Tạo mới
    */
    async create(payload: Partial<MODELS.PriceTollBuyingPayload>): Promise<ApiResponse<MODELS.PriceTollBuyingResponse>> {
        return await test.step('Gọi API tạo mới giá vé cầu đường', async () => {
            return this.apiClient.post<typeof payload, MODELS.PriceTollBuyingResponse>({
                url: ENDPOINTS.PRICE_TOLL_BUYING.CREATE,
                data: payload
            });
        });
    }

    /**
    * Xoá
    */
    async delete(id: string): Promise<ApiResponse<unknown>> {
        return await test.step('Gọi API xóa giá vé cầu đường', async () => {
            return await this.apiClient.delete({
                url: ENDPOINTS.PRICE_TOLL_BUYING.DELETE(id)
            });
        });
    }
}
