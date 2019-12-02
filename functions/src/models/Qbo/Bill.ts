import { LinkedTxn } from "./subTypes/LinkedTxn";

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
  CurrencyRef: { value: string; name: string };
  LinkedTxn: Array<LinkedTxn>;
  Line: Array<{
    Id: string;
    Amount: number;
    DetailType: string;
    ItemBasedExpenseLineDetail: {
      BillableStatus: string;
      ItemRef: {
        value: string;
        name: string;
      };
      UnitPrice: number;
      Qty: number;
      TaxCodeRef: {
        value: string;
      };
    };
  }>;
  VendorRef: {
    value: string;
    name: string;
  };
  APAccountRef: {
    value: string;
    name: string;
  };
  TotalAmt: number;
}
