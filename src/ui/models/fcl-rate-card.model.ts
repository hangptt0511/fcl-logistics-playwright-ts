import { FlexibleColumnMap } from "@utils/verification/data-verification";

export interface FCLRateCardData {
    customer?: string;
    quotationCode?: string;
    contractNo?: string;
    price?: number;
    rateCardName?: string;
    effectedDate?: string;
    expiredDate?: string;
}

export const CONVERT_BOOKING_REQUIRED_KEYS = ['quantity'] as const;

export const TableColumnMap: FlexibleColumnMap<FCLRateCardData> = {
    'Name': 'rateCardName',
    'Customer': 'customer',
    'Contract No': 'contractNo',
    'Effected Date': 'effectedDate',
    'Expired Date': 'expiredDate',
};