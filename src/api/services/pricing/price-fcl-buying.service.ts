import { test } from '@playwright/test';
import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/price-fcl-buying.model"
import { ApiResponse, BaseApiResponseWrapper } from "@api/core/types";
import { RequestPayload } from '@api/models/common.model';

export class PriceFCLBuyingService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

    /**
    * Tìm kiếm theo bộ lọc
    */
    async search(params: Partial<MODELS.PriceFCLBuyingSearchParams>): Promise<ApiResponse<MODELS.PriceFCLBuyingSearchResponse>> {
        return await test.step('Gọi API tìm kiếm giá mua FCL', async () => {
            return await this.apiClient.get<MODELS.PriceFCLBuyingSearchResponse>({
                url: ENDPOINTS.PRICE_FCL_BUYING.LIST,
                params
            });
        });

    }

    /**
    * Tạo mới
    */
    async create(payload: Partial<MODELS.PriceFCLBuyingPayload>): Promise<ApiResponse<MODELS.PriceFCLBuyingResponse>> {
        return await test.step('Gọi API tạo mới giá mua FCL', async () => {
            return this.apiClient.post<typeof payload, MODELS.PriceFCLBuyingResponse>({
                url: ENDPOINTS.PRICE_FCL_BUYING.CREATE,
                data: payload
            });
        });
    }

    /**
    * Xoá
    */
    async delete(id: string): Promise<ApiResponse<unknown>> {
        return await test.step('Gọi API xóa giá mua FCL', async () => {
            return await this.apiClient.delete({
                url: ENDPOINTS.PRICE_FCL_BUYING.DELETE(id)
            });
        });
    }

    /**
    * Gửi duyệt
    */
    async sendRequest<T>(payload: Partial<RequestPayload>): Promise<ApiResponse<BaseApiResponseWrapper<T>>> {
        return await test.step('Gọi API gửi yêu cầu duyệt giá mua FCL', async () => {
            return this.apiClient.put<typeof payload, BaseApiResponseWrapper<T>>({
                url: ENDPOINTS.PRICE_FCL_BUYING.SEND_REQUEST,
                data: {
                    ...payload,
                    action: 20
                }
            });
        });
    }

    /**
     * Duyệt
     */
    async approve<T>(payload: Partial<RequestPayload>): Promise<ApiResponse<BaseApiResponseWrapper<T>>> {
        return await test.step('Gọi API duyệt giá mua FCL', async () => {
            return this.apiClient.put<typeof payload, BaseApiResponseWrapper<T>>({
                url: ENDPOINTS.PRICE_FCL_BUYING.APPROVE,
                data: {
                    ...payload,
                    action: 21
                }
            });
        });
    }

    /**
     * Hủy
     */
    async revoke<T>(payload: Partial<RequestPayload>): Promise<ApiResponse<BaseApiResponseWrapper<T>>> {
        return await test.step('Gọi API hủy giá mua FCL', async () => {
            return this.apiClient.put<typeof payload, BaseApiResponseWrapper<T>>({
                url: ENDPOINTS.PRICE_FCL_BUYING.APPROVE,
                data: {
                    ...payload,
                    action: 23
                }
            });
        });
    }
}
