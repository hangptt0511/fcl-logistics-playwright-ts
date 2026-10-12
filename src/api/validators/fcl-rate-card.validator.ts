import { BaseValidator } from '@api/validators/base.validator';
import * as MODELS from '@api/models/fcl-rate-card.model';
import { ReadBackConfig } from '@api/models/common.model';
import { FCLRateCardService } from '@api/services/pricing/fcl-rate-card.service';
import { DateUtil } from '@utils/data/date.util';
import { FCLRateCardData } from '@ui/models/fcl-rate-card.model';

export class FCLRateCardValidator extends BaseValidator {
  constructor(private readonly service: FCLRateCardService) {
    super();
  }

  buildReadBackConfig(): ReadBackConfig<
    FCLRateCardData,
    MODELS.FCLRateCardSearchResponse,
    MODELS.FFCLRateCardItem
  > {
    {
      return {
        searchApiCall: (payload) => {
          const date = DateUtil.getCurrentDate();
          return this.service.search({
            fromDate: date,
            toDate: date,
          });
        },
        extractItems: (data) => data.value.updating,
        matchItem: (item, payload) => item.rateCardName === payload.rateCardName,
        getId: (item) => item.id,
        getCode: (item) => item.code,
      };
    }
  }
}