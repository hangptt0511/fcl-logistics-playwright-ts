import { BaseValidator } from '@api/validators/base.validator';
import * as MODELS from '@api/models/fcl-quotation.model';
import { ReadBackConfig } from '@api/models/common.model';
import { FCLQuotationService } from '@api/services/fcl-quotation.service';
import { DateUtil } from '@utils/data/date.util';
import { FCLQuotationData } from '@ui/models/fcl-quotation.model';

export class FCLQuotationValidator extends BaseValidator {
  constructor(private readonly service: FCLQuotationService) {
    super();
  }

  //Profit = Returning Shipment + Sale Cost - Min Price
  //Final Price = Returning Shipment + Sale Cost
  buildReadBackConfig(): ReadBackConfig<
    FCLQuotationData,
    MODELS.FCLQuotationSearchResponse,
    MODELS.FCLQuotationItem
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
        extractItems: (data) => data.value.accepted,
        matchItem: (item, payload) => item.note === payload.note,
        getId: (item) => item.id,
        getCode: (item) => item.code,
      };
    }
  }
}