import { LinkedTxn } from "../common";

export interface Payment {
  CustomerRef: {
    value: string;
    name?: string;
  };
  PaymentRefNum: string;
  DepositToAccountRef?: {
    value: "4";
  };
  UnappliedAmt?: number;
  ProcessPayment?: false;
  domain?: "QBO";
  sparse?: false;
  Id?: string;
  SyncToken?: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  TxnDate?: string;
  TotalAmt: number;
  Line: Array<LineItems>;
}

export type LineItems = {
  Amount: number;
  LinkedTxn: Array<LinkedTxn>;
};
