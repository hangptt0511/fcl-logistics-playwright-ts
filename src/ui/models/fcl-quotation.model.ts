import { FlexibleColumnMap } from '@utils/verification/data-verification';
import { Weekday } from '@utils/data/date.util';

export interface FCLQuotationData {
    customer?: string;
    containerType?: string;
    weightRange?: string;
    poLoading?: string;
    poDischarge?: string;
    weekdays?: Weekday[];
    cargoType?: string[];
    netWeight?: number;
    saleCost?: number;
    total?: number;
    profit?: number;
    type?: string;
    status?: string;
    note?:string;

}

export const TableColumnMap: FlexibleColumnMap<FCLQuotationData> = {
    "Customer": "customer",
    "Final Price": { key: "total", format: "decimal" },
    "Profit": { key: "profit", format: "decimal" },
    "Type": "type",
    "OPS Manager's Status": "status",
    "Accountant's Status": "status",
    "Head Of BU Status": "status",
};

export const EditFormColumnMap: FlexibleColumnMap<FCLQuotationData> = {
    "Container Type": "containerType",
    "Weight Range": "weightRange",
    'Place Of Loading': 'poLoading',
    "Place Of Discharge": "poDischarge",
    "Weekdays": "weekdays",
};