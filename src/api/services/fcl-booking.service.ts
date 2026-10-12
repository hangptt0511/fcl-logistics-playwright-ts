import { test } from '@playwright/test';
import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/fcl-booking.model"
import { ApiResponse } from "@api/core/types";

export class FCLBookingService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

     /**
     * Tìm kiếm theo bộ lọc
     */
    async search(params: Partial<MODELS.FCLBookingSearchParams>): Promise<ApiResponse<MODELS.FCLBookingSearchResponse>> {
        return await test.step('Gọi API tìm kiếm giá mua FCL', async () => {
            return await this.apiClient.get<MODELS.FCLBookingSearchResponse>({
                url: ENDPOINTS.FCL_BOOKING.LIST,
                params
            });
        });

    }

     /**
     * Xoá
     */
    async delete(id: string): Promise<ApiResponse<unknown>> {
        return await this.apiClient.delete({
            url: ENDPOINTS.FCL_BOOKING.DELETE(id)
        });
    }
}
