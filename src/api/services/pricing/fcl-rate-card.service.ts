import { test } from '@playwright/test';
import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/fcl-rate-card.model"
import { ApiResponse, BaseApiResponseWrapper } from "@api/core/types";
import { RequestPayload } from '@api/models/common.model';

export class FCLRateCardService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

    /**
    * Tìm kiếm theo bộ lọc
    */
    async search(params: Partial<MODELS.FCLRateCardSearchParams>): Promise<ApiResponse<MODELS.FCLRateCardSearchResponse>> {
        return await test.step('Gọi API tìm kiếm bảng giá', async () => {
            return await this.apiClient.get<MODELS.FCLRateCardSearchResponse>({
                url: ENDPOINTS.PRICE_FCL_RATE_CARD.LIST,
                params
            });
        });

    }

    /**
     * Hủy
     */
    async revoke<T>(payload: Partial<RequestPayload>): Promise<ApiResponse<BaseApiResponseWrapper<T>>> {
        return await test.step('Gọi API hủy giá mua FCL', async () => {
            return this.apiClient.put<typeof payload, BaseApiResponseWrapper<T>>({
                url: ENDPOINTS.PRICE_FCL_RATE_CARD.APPROVE,
                data: {
                    ...payload,
                    action: 23
                }
            });
        });
    }
}
