import {LinkedTxn} from "./subTypes/LinkedTxn";
import {ReferenceType} from "./subTypes/ClassRef";

export interface Payment {
  CustomerRef: ReferenceType;
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
