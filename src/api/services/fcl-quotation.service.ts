import { test } from '@playwright/test';
import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/fcl-quotation.model"
import { ApiResponse, BaseApiResponseWrapper } from "@api/core/types";
import { CleanupOptions } from "@utils/cleanup.util";

export class FCLQuotationService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

    /**
    * Tìm kiếm theo bộ lọc
    */
    async search(params: Partial<MODELS.FCLQuotationSearchParams>): Promise<ApiResponse<MODELS.FCLQuotationSearchResponse>> {
        return await test.step('Gọi API tìm kiếm bảng phân tích giá FCL', async () => {
            return await this.apiClient.get<MODELS.FCLQuotationSearchResponse>({
                url: ENDPOINTS.FCL_QUOTATION.LIST,
                params
            });
        });

    }

    /**
     * Hủy
     */
    async revoke<T>(
        { id, ...rest }: CleanupOptions & Partial<MODELS.RevokePayload>,
    ): Promise<ApiResponse<BaseApiResponseWrapper<T>>> {
        return await test.step('Gọi API hủy giá mua FCL', async () => {
            return this.apiClient.put<unknown, BaseApiResponseWrapper<T>>({
                url: ENDPOINTS.FCL_QUOTATION.REVOKE,
                data: {
                    ...rest,
                    status: 2,
                    quotationId: id,
                }
            });
        });
    }
}
