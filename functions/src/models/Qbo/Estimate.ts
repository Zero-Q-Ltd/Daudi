import { BillAddr } from "./subTypes/BillAddr";
import { ShipAddr } from "./subTypes/ShipAddr";
import { Line } from "./subTypes/Line";
import { QboMetaData } from "./subTypes/QboMetaData";
import { CustomField } from "./subTypes/CustomField";

export interface BillEmail {
    Address: string;
}

export interface CustomerRef {
    name: string;
    value: string;
}

export interface CustomerMemo {
    value: string;
}

export interface TaxCodeRef {
    value: string;
}

export interface ItemRef {
    name: string;
    value: string;
}

export interface SubTotalLineDetail {
}

export interface DiscountAccountRef {
    name: string;
    value: string;
}

export interface TxnTaxDetail {
    TotalTax: number;
}


export interface Estimate {
    DocNumber: string;
    SyncToken: string;
    domain: string;
    TxnStatus: string;
    BillEmail: BillEmail;
    TxnDate: string;
    TotalAmt: number;
    CustomerRef: CustomerRef;
    CustomerMemo: CustomerMemo;
    ShipAddr: ShipAddr;
    PrintStatus: string;
    BillAddr: BillAddr;
    sparse: boolean;
    EmailStatus: string;
    Line: Line[];
    ApplyTaxAfterDiscount: boolean;
    CustomField: CustomField[];
    Id: string;
    TxnTaxDetail: TxnTaxDetail;
    MetaData: QboMetaData;
}

