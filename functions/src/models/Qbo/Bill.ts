import {LinkedTxn} from "./subTypes/LinkedTxn";
import {ReferenceType} from "./subTypes/ClassRef";

export interface Bill {
  DueDate: string;
  Balance: number;
  domain: "QBO";
  sparse: boolean;
  Id: string;
  SyncToken: string;
  MetaData: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  DocNumber: string;
  TxnDate: string;
  CurrencyRef: ReferenceType;
  LinkedTxn: Array<LinkedTxn>;
  Line: Array<{
    Id: string;
    Amount: number;
    DetailType: string;
    ItemBasedExpenseLineDetail: {
      BillableStatus: string;
      ItemRef: ReferenceType;
      UnitPrice: number;
      Qty: number;
      TaxCodeRef: ReferenceType;
    };
  }>;
  VendorRef: ReferenceType;
  APAccountRef: ReferenceType;
  TotalAmt: number;
}
