import { expect } from '@playwright/test';
import { logger } from "@utils/logger";
import { BaseApiResponseWrapper, ApiResponse } from '../core/types';
import { GenericCreateTestCase, ReadBackConfig } from '@api/models/common.model';

/**
 * Core Framework Layer - Base Assertion Engine cho mọi API
 */
export class BaseValidator {

  /**
   * Assert HTTP Status Code - dùng hard assert vì đây là điều kiện tiên quyết,
   * nếu sai thì các bước validate sau (đọc response.data) rất dễ lỗi runtime theo
   */
  assertStatusCode<T>(response: ApiResponse<T>, expectedStatus: number, message = 'Xác minh HTTP Status Code') {
    const actualStatus = this.getEffectiveStatus(response);

    if (actualStatus !== expectedStatus) {
      logger.error(message, {
        expectedStatus,
        actualStatus,
        httpStatus: response.status,
        responseBody: response.data,
      });
    }

    expect(actualStatus, message).toBe(expectedStatus);
  }

  /**
 * Một số API luôn trả HTTP status 200 (transport-level), status nghiệp vụ thật
 * nằm trong body dạng { status, message, isResponseResult: true }.
 * Hàm này chuẩn hoá: nếu body có isResponseResult === true, dùng body.status
 * làm status hiệu lực; ngược lại dùng thẳng HTTP status như bình thường.
 */
  private getEffectiveStatus<T>(response: ApiResponse<T>): number {
    const body = response.data as any;

    if (body && typeof body === 'object' && body.isResponseResult === true && typeof body.status === 'number') {
      return body.status;
    }

    return response.status;
  }

  /**
   * Trích message lỗi, ưu tiên body.message (kiểu API wrap status) trước,
   * sau đó mới fallback về unwrapEnvelope cũ (kiểu { value: {...} })
   */
  private extractErrorMessage<T>(response: ApiResponse<T>): unknown {
    const body = response.data as any;

    if (body && typeof body === 'object' && body.isResponseResult === true && 'message' in body) {
      return body.message;
    }

    return this.unwrapEnvelope(response.data);
  }

  /**
   * Assert response lỗi (tổng quát cho mọi status lỗi: 400, 409, 422...)
   * Tự động unwrap envelope { value: {...} } nếu backend trả về dạng đó
   */
  assertErrorResponse<T = Record<string, string[]>>(
    response: ApiResponse<T>,
    expectedStatus: number,
    expectedErrorField?: string,
    expectedErrorContains?: string
  ) {
    this.assertStatusCode(response, expectedStatus);

    const errorValues = this.extractErrorMessage(response);

    if (expectedErrorField && errorValues && typeof errorValues === 'object') {
      const targetObject = errorValues as Record<string, unknown>;
      expect.soft(
        targetObject,
        `Xác minh có tồn tại trường ${expectedErrorField} trong Response Body`
      ).toHaveProperty([expectedErrorField]);
    }

    if (expectedErrorContains) {
      const actualMessage = typeof errorValues === 'string'
        ? errorValues
        : JSON.stringify(errorValues);

      expect.soft(
        actualMessage,
        `Xác minh thông báo lỗi trong Response Body`
      ).toContain(expectedErrorContains);
    }
  }

  /**
   * Assert response thành công (200 OK), trả về data đã kiểm chứng để dùng tiếp
   */
  assertSuccess<T = unknown>(response: ApiResponse<T>, expectedName?: string, expectedValue?: string) {
    this.assertStatusCode(response, 200);

    const actualData = response.data as any;

    if (expectedName) {
      expect.soft(
        actualData?.name,
        `Xác minh dữ liệu trường name trong Response Body`
      ).toBe(expectedName);
    }

    if (expectedValue) {
      expect.soft(
        actualData?.value,
        `Xác minh dữ liệu trường value trong Response Body`
      ).toBe(expectedValue);
    }
  }

  /**
   * Assert Read-Back Search - verify dữ liệu vừa tạo có tìm lại được qua API search
   * Dùng callback pattern để tái sử dụng cho mọi module mà không cần biết
   * chi tiết cấu trúc response của từng module
   */
  async assertReadBackSearch<TSearchResponse, TItem>(
    searchApiCall: () => Promise<ApiResponse<TSearchResponse>>,
    extractItemsFn: (responseData: TSearchResponse) => TItem[],
    validateItemCallback: (items: TItem[]) => void
  ): Promise<void> {
    const searchResponse = await searchApiCall();

    if (searchResponse.status !== 200) {
      logger.error('Goi API tìm kiếm bản ghi vừa tạo không thành công', {
        expectedStatus: 200,
        actualStatus: searchResponse.status,
        responseBody: searchResponse.data,
      });
    }

    const items = extractItemsFn(searchResponse.data);
    logger.debug('Kết quả tìm kiếm bản ghi vừa tạo qua API', { itemCount: items.length });

    // Uỷ quyền cho module cụ thể validate chi tiết từng item
    validateItemCallback(items);
  }

  /**
 * @param actual - object lấy từ response (kiểu TActual, vd item search)
 * @param expected - object chứa field kỳ vọng (kiểu TExpected, vd payload gốc) -
 *   không cần cùng type với actual, chỉ cần các field trùng tên được so sánh,
 *   field nào có trong expected nhưng không có trong actual sẽ bị bỏ qua khi so sánh
 *   (đã xử lý ở logic bên trong, không tính là mismatch)
 */
  assertMatchPayload<TActual extends object, TExpected extends object>(
    actual: TActual | undefined,
    expected: Partial<TExpected>,
    label: string,
    excludeFields: Array<keyof TExpected> = []
  ): void {
    if (!actual) return;

    const mismatchedFields: Array<{ field: string; expected: unknown; actual: unknown }> = [];

    for (const key of Object.keys(expected) as Array<keyof TExpected>) {
      if (excludeFields.includes(key)) continue;

      const expectedValue = expected[key];
      // actual có thể không có field này (TActual và TExpected khác cấu trúc) -> ép kiểu tra cứu bằng key chung
      const actualValue = (actual as Record<string, unknown>)[key as string];

      if (!this.isEqual(expectedValue, actualValue)) {
        mismatchedFields.push({ field: String(key), expected: expectedValue, actual: actualValue });
      }
    }

    if (mismatchedFields.length > 0) {
      logger.error(`${label} - có trường không trùng khớp`, { mismatchedFields });
    }

    expect.soft(
      mismatchedFields,
      `${label} - các trường không trùng khớp: ${JSON.stringify(mismatchedFields, null, 2)}`
    ).toEqual([]);
  }

  /**
     * So sánh 2 giá trị, hỗ trợ so sánh object/array lồng nhau và tự động chuẩn hóa định dạng ngày tháng ISO 8601
     */
  private isEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;

    // Xử lý đặc thù cho chuỗi ngày tháng (Date string vs ISO 8601 full string)
    if (typeof a === 'string' && typeof b === 'string') {
      const isDateA = /^\d{4}-\d{2}-\d{2}/.test(a);
      const isDateB = /^\d{4}-\d{2}-\d{2}/.test(b);

      if (isDateA && isDateB) {
        // Cắt chuỗi lấy phần ngày-tháng-năm (YYYY-MM-DD) để so sánh tương đương
        return a.split('T')[0] === b.split('T')[0];
      }
    }

    if (typeof a === 'object' && a !== null && b !== null) {
      return JSON.stringify(a) === JSON.stringify(b);
    }

    return false;
  }

  /**
   * Một số API trả lỗi/dữ liệu dạng envelope { value: {...} },
   * một số trả thẳng object - hàm này chuẩn hoá về 1 dạng duy nhất
   */
  private unwrapEnvelope<T>(body: BaseApiResponseWrapper<T> | T): unknown {
    if (body && typeof body === 'object' && 'value' in body) {
      return (body as BaseApiResponseWrapper<T>).value;
    }
    return body;
  }

  /**
   * Verify cho test case dạng "create" (dùng chung cho mọi API tạo mới).
   * Module cụ thể chỉ cần cung cấp readBackConfig (cách search/match/lấy id-code),
   * không cần tự viết lại logic branch theo status hay xử lý cleanup khi backend bug.
   */
  protected async verifyCreateTestCase<TResponse, TPayload, TSearchResponse, TItem extends object>(
    response: ApiResponse<TResponse>,
    testCase: GenericCreateTestCase<TPayload>,
    readBackConfig: ReadBackConfig<TPayload, TSearchResponse, TItem>,
    existingRecordCode?: string
  ): Promise<{ createdId?: string; createdCode?: string }> {
    const expectedStatus = testCase.expectedResponse.status;

    if (expectedStatus !== 200) {
      return this.verifyExpectedBadRequest(response, testCase, readBackConfig, existingRecordCode);
    }
    else {
      this.assertSuccess(response, testCase.expectedResponse.name, testCase.expectedResponse.value);
      const { id, code } = await this.verifyReadBackAfterCreate(testCase, readBackConfig);
      return { createdId: id, createdCode: code };
    }
  }

  /**
 * Chỉ tìm và lấy bản ghi khớp payload qua API search
 * Trả về undefined nếu không tìm thấy bản ghi nào khớp
 */
  async getIdReadBackConfig<TPayload, TSearchResponse, TItem extends object>(
    payload: Partial<TPayload>,
    readBackConfig: ReadBackConfig<TPayload, TSearchResponse, TItem>
  ): Promise<{ createdId?: string; createdCode?: string }> {
    const searchResponse = await readBackConfig.searchApiCall(payload);

    if (searchResponse.status !== 200) {
      logger.error('Gọi API tìm kiếm bản ghi thất bại khi cố lấy id để cleanup', {
        expectedStatus: 200,
        actualStatus: searchResponse.status,
        responseBody: searchResponse.data,
      });
      return {};
    }

    const items = readBackConfig.extractItems(searchResponse.data);
    const matchedItem = items.find((i) => readBackConfig.matchItem(i, payload));

    if (!matchedItem) {
      logger.error('Không tồn tại bản ghi trùng khớp với Request Payload đã gửi trong Response Body của API tìm kiếm', {
        responseBody: items,
      });
      return {};
    }

    return { createdId: readBackConfig.getId(matchedItem!), createdCode: readBackConfig.getCode?.(matchedItem!) };
  }

  private async verifyExpectedBadRequest<TResponse, TPayload, TSearchResponse, TItem extends object>(
    response: ApiResponse<TResponse>,
    testCase: GenericCreateTestCase<TPayload>,
    readBackConfig: ReadBackConfig<TPayload, TSearchResponse, TItem>,
    existingRecordCode?: string
  ): Promise<{ createdId?: string }> {
    const actualStatus = this.getEffectiveStatus(response);

    // Sai kỳ vọng: lẽ ra 400 nhưng lại 200 - backend thiếu validate, cần cleanup
    if (actualStatus === 200) {
      const created = await this.getIdReadBackConfig(testCase.payload, readBackConfig);

      expect.soft(actualStatus, `Xác minh HTTP Status Code`).toBe(400);
      return { createdId: created.createdId };
    }

    // Đúng như kỳ vọng
    this.assertErrorResponse(response, actualStatus, testCase.expectedResponse.errorField
    );

    if (testCase.expectedResponse.verifyCodeMatchesExisting && existingRecordCode) {
      if (!this.extractCodeFromMessage) {
        throw new Error(
          `[BaseValidator] Test case '${testCase.id}' yêu cầu verifyCodeMatchesExisting nhưng ` +
          `readBackConfig chưa cung cấp extractCodeFromMessage`
        );
      }

      const actualMessage = response.data as unknown as string;
      const actualCode = this.extractCodeFromMessage(actualMessage);

      expect(actualCode, `Xác minh có tồn tại mã trong Response Body`).toBeDefined();
      expect(
        actualCode,
        `Xác minh mã trả về trong Response Body trùng khớp với mã của bản ghi đã tồn tại trong hệ thống`
      ).toBe(existingRecordCode);
    }

    return {};
  }

  private async verifyReadBackAfterCreate<TPayload, TSearchResponse, TItem extends object>(
    testCase: GenericCreateTestCase<TPayload>,
    readBackConfig: ReadBackConfig<TPayload, TSearchResponse, TItem>
  ): Promise<{ id: string; code?: string }> {
    let createdId!: string;
    let createdCode: string | undefined;

    await this.assertReadBackSearch<TSearchResponse, TItem>(
      () => readBackConfig.searchApiCall(testCase.payload),
      readBackConfig.extractItems,
      (items) => {
        const matchedItem = items.find((i) => readBackConfig.matchItem(i, testCase.payload));

        expect(matchedItem, 'Xác minh có tồn tại bản ghi vừa tạo trong Response Body của API tìm kiếm').toBeDefined();

        const expected = readBackConfig.buildExpectedForMatch
          ? readBackConfig.buildExpectedForMatch(testCase.payload)
          : testCase.payload;

        this.assertMatchPayload(
          matchedItem,
          expected,
          'Xác minh dữ liệu vừa tạo trùng khớp với Request Payload đã gửi'
        );

        createdId = readBackConfig.getId(matchedItem!);
        createdCode = readBackConfig.getCode?.(matchedItem!);
      }
    );

    return { id: createdId, code: createdCode };
  }


  /**
  * Trích mã bảng giá (vd: "0010926/FBUY-VNHCM") từ message lỗi dạng:
  * "... code = 0010926/FBUY-VNHCM"
  */
  private extractCodeFromMessage(message: string): string | undefined {
    const text = typeof message === 'string' ? message : JSON.stringify(message ?? '');
    return text.match(/\bcode\s*=\s*([^\s;,"]+)/i)?.[1];
  }

}
