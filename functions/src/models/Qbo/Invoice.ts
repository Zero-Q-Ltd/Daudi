import {LinkedTxn} from "./subTypes/LinkedTxn";
import {CustomField} from "./subTypes/CustomField";
import {BillEmail} from "./subTypes/BillEmail";
import {TxnTaxDetail} from "./subTypes/TxnTaxDetail";
import {Line} from "./subTypes/Line";
import {PrintStatus} from "./enums/PrintStatus";
import {EmailStatus} from "./enums/EmailStatus";
import {ReferenceType} from './subTypes/ClassRef';

export interface Invoice {
  Line?: Array<Line>;
  CustomerRef?: ReferenceType;
  Deposit?: number;
  AllowIPNPayment?: boolean;
  AllowOnlinePayment?: boolean;
  AllowOnlineCreditCardPayment?: boolean;
  AllowOnlineACHPayment?: boolean;
  domain: "QBO";
  sparse?: boolean;
  Id?: string;
  SyncToken?: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  CustomField?: Array<CustomField>;
  DocNumber?: string;
  TxnDate?: string;
  CurrencyRef?: ReferenceType;
  LinkedTxn?: Array<LinkedTxn>;
  TxnTaxDetail?: TxnTaxDetail;
  Balance?: number;
  DueDate?: string;
  TotalAmt?: number;
  ApplyTaxAfterDiscount?: boolean;
  PrintStatus?: PrintStatus;
  EmailStatus?: EmailStatus;
  BillEmail: BillEmail
  /**
   * @description allow voiding an invoice
   */
  void?: boolean;
  Notes?: string;
  CustomerMemo?: {
    value: string;
  };
  DepartmentRef?: ReferenceType,

  ClassRef: ReferenceType,
  AutoDocNumber?: boolean;
}


