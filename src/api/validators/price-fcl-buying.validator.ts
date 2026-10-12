import { BaseValidator } from '@api/validators/base.validator';
import * as MODELS from '@api/models/price-fcl-buying.model';
import { GenericCreateTestCase, ReadBackConfig } from '@api/models/common.model';
import { PriceFCLBuyingService } from '@api/services/pricing/price-fcl-buying.service';
import { ApiResponse } from '@api/core/types';
import { DateUtil } from '@utils/data/date.util';

export class PriceFCLBuyingValidator extends BaseValidator {
  constructor(private readonly service: PriceFCLBuyingService) {
    super();
  }

  buildReadBackConfig(): ReadBackConfig<
    MODELS.PriceFCLBuyingPayload,
    MODELS.PriceFCLBuyingSearchResponse,
    MODELS.PriceFCLBuyingItem
  > {
    {
      return {
        searchApiCall: (payload) => {
         const date = DateUtil.getCurrentDate();
          return this.service.search({
            fromDate: date,
            toDate: date,
            placeFrom: payload.placeFrom!,
            placeTo: payload.placeTo!,
            supplierId: payload.supplierId!,
          });
        },
        extractItems: (data) => data.value,
        matchItem: (item, payload) => item.note === payload.note,
        getId: (item) => item.id,
        getCode: (item) => item.code
      };

    }
  }

  async verifyTestCase(
    response: ApiResponse<MODELS.PriceFCLBuyingResponse>,
    testCase: GenericCreateTestCase<MODELS.PriceFCLBuyingPayload>,
    existingRecordCode?: string
  ): Promise<{ createdId?: string; createdCode?: string }> {
    return this.verifyCreateTestCase(response, testCase, this.buildReadBackConfig(), existingRecordCode);
  }
}