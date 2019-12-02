import { QboMetaData } from "./subTypes/QboMetaData";

export interface AgencyRef {
    value: string;
}

export interface TaxRate {
    RateValue: number;
    AgencyRef: AgencyRef;
    domain: string;
    Name: string;
    SyncToken: string;
    SpecialTaxType: string;
    DisplayType: string;
    sparse: boolean;
    Active: boolean;
    MetaData: QboMetaData;
    Id: string;
    Description: string;
}