import { test as setup, request } from '@playwright/test';
import { RsaCryptoHelper } from '@utils/security/rsa-crypto.helper';
import { AuthenticationService } from "@api/services/auth.service"
import { ApiClient } from "@api/core/api-client";
import { SessionManager } from "@api/core/session-manager";
import { AuthValidator } from "@api/validators/auth.validator";
import { logger } from "@utils/logger";

export const authFile = 'playwright/.auth/user.json'

setup('authenticate via API', async ({ page }) => {
  const requestContext = await request.newContext({
    baseURL: process.env.BASE_URL,
  });
  const apiClient = new ApiClient(requestContext);
  const authenticationService = new AuthenticationService(apiClient);

  // Bước 1: Password grant - xác thực username/password (đã RSA encrypt), lấy refresh_token tạm 
  let connectPRequest = {
    grant_type: process.env.OAUTH_GRANT_TYPE_P!,
    client_id: process.env.OAUTH_CLIENT_ID!,
    username: RsaCryptoHelper.encode(process.env.ADMIN_USERNAME!, process.env.PUBLIC_KEY!),
    password: RsaCryptoHelper.encode(process.env.ADMIN_PASSWORD!, process.env.PUBLIC_KEY!),
  };

  let connectPResponse = await authenticationService.connect(connectPRequest);
  AuthValidator.validateLoginResponse(connectPResponse, 1)

  // Bước 2: Refresh grant kèm workplace_id để lấy access_token cuối cùng, vì hệ thống yêu cầu chọn workplace sau khi login
  let connectRRequest = {
    grant_type: process.env.OAUTH_GRANT_TYPE_R!,
    client_id: process.env.OAUTH_CLIENT_ID!,
    refresh_token: connectPResponse.data.refresh_token,
    workplace_id: process.env.OAUTH_WORKPLATE_ID,
  };

  let connectRResponse = await authenticationService.connect(connectRRequest);
  AuthValidator.validateLoginResponse(connectPResponse, 2)

  // Mở một trang trống thuộc domain để inject state vào localstorage
  await page.goto(`${process.env.APP_BASE_URL}`);

  const now = Date.now();
  const loginData = {
    lang: 'en-US',
    access_token_stored_at: now.toString(),
    id_wp: process.env.STORAGE_ID_WP!,
    usr_inf: process.env.STORAGE_USR_INF!,
    access_token: connectRResponse.data.access_token,
    allowNotification: 'true',
    refresh_token: connectRResponse.data.refresh_token,
    granted_scopes: JSON.stringify(connectRResponse.data.scope.split(" ")),
    expires_at: (now + connectRResponse.data.expires_in * 1000).toString(),
    wp_c: process.env.STORAGE_WP_C!
  };

  await page.evaluate((data) => {
    Object.entries(data).forEach(([key, value]) => localStorage.setItem(key, value));
  }, loginData);

  // Lưu lại toàn bộ state chuẩn vào file user.json
  await page.context().storageState({ path: authFile });

  // Lưu lại admin session
  await SessionManager.save('admin', page);

  // Đóng API context
  await requestContext.dispose();

  logger.success('Đã tạo storageState thành công');
});
