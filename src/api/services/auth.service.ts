import { ApiClient } from "@api/core/api-client";
import { ENDPOINTS } from "@api/core/endpoints"
import * as MODELS from "@api/models/auth.model"
import { ApiResponse } from "@api/core/types";

/** Service gọi API cho tính đăng nhập */
export class AuthenticationService {
    constructor(
        private readonly apiClient: ApiClient
    ) { }

    /**
    * Gọi API connect - dùng chung cho 2 loại grant:
    * - password grant: login lần đầu bằng username/password (đã RSA encrypt)
    * - refresh_token grant: đổi lấy access_token cuối, bind theo workplace_id
    * Loại grant được xác định qua field `grant_type` trong request
    */
    async connect(request: MODELS.ConnectRequest): Promise<ApiResponse<MODELS.ConnectResponse>> {
        return this.apiClient.post<MODELS.ConnectRequest, MODELS.ConnectResponse>({
            url: ENDPOINTS.AUTH.CONNECT,
            contentType: "application/x-www-form-urlencoded",
            data: request,
        });
    }
}