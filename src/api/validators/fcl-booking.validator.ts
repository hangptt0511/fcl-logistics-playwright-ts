import { BaseValidator } from '@api/validators/base.validator';
import * as MODELS from '@api/models/fcl-booking.model';
import { ReadBackConfig } from '@api/models/common.model';
import { FCLBookingService } from '@api/services/fcl-booking.service';
import { DateUtil } from '@utils/data/date.util';
import { FCLBookingData } from '@ui/models/fcl-booking.model';

export class FCLBookingValidator extends BaseValidator {
  constructor(private readonly service: FCLBookingService) {
    super();
  }

  buildReadBackConfig(): ReadBackConfig<
    FCLBookingData,
    MODELS.FCLBookingSearchResponse,
    MODELS.FCLBookingItem
  > {
    {
      return {
        searchApiCall: (payload) => {
          const date = DateUtil.getCurrentDate();
          return this.service.search({
            fromDate: date,
            toDate: date,
            type: 'CreatedDate'
          });
        },
        extractItems: (data) => data.value,
        matchItem: (item, payload) => !!payload.remark && item.remark === payload.remark,
        getId: (item) => item.id,
        getCode: (item) => item.code
      };
    }
  }
}