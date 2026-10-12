import { BaseValidator } from '@api/validators/base.validator';
import * as MODELS from '@api/models/price-toll-buying.model';
import { GenericCreateTestCase, ReadBackConfig } from '@api/models/common.model';
import { PriceTollBuyingService } from '@api/services/pricing/price-toll-buying.service';
import { ApiResponse } from '@api/core/types';
import { DateUtil } from '@utils/data/date.util';

export class PriceTollBuyingValidator extends BaseValidator {
  constructor(private readonly service: PriceTollBuyingService) {
    super();
  }

  private buildReadBackConfig(): ReadBackConfig<
    MODELS.PriceTollBuyingPayload,
    MODELS.PriceTollBuyingSearchResponse,
    MODELS.PriceTollBuyingItem
  > {
    {
      return {
        searchApiCall: (payload) => {
          const today = DateUtil.getCurrentDate();
          return this.service.search({
            FromDate: today,
            ToDate: today,
          });
        },
        extractItems: (data) => data.value.updating,
        matchItem: (item, payload) => item.botId === payload.Master?.botId,
        getId: (item) => item.id,
        getCode: (item) => item.code,
        buildExpectedForMatch: (payload) => payload.Master ?? {},
      };

    }
  }

  async verifyTestCase(
    response: ApiResponse<MODELS.PriceTollBuyingResponse>,
    testCase: GenericCreateTestCase<MODELS.PriceTollBuyingPayload>,
    existingRecordCode?: string
  ): Promise<{ createdId?: string; createdCode?: string }> {
    return this.verifyCreateTestCase(response, testCase, this.buildReadBackConfig(), existingRecordCode);
  }
}