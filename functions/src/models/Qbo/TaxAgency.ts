import { QboMetaData } from "./subTypes/QboMetaData";

export interface TaxAgency {
    SyncToken?: string;
    domain: "QBO";
    DisplayName: string;
    TaxTrackedOnSales: boolean;
    TaxTrackedOnPurchases: boolean;
    sparse?: boolean;
    Id?: string;
    MetaData?: QboMetaData;
}
