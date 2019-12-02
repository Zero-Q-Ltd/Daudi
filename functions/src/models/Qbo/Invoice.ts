import { LinkedTxn, QbcustomField } from "../common";
import { BillEmail } from "./Estimate";

export interface Invoice {
  Line?: Array<ItemLine>;
  CustomerRef?: {
    value: string;
    name?: string;
  };
  Deposit?: number;
  AllowIPNPayment?: boolean;
  AllowOnlinePayment?: boolean;
  AllowOnlineCreditCardPayment?: boolean;
  AllowOnlineACHPayment?: boolean;
  domain?: "QBO";
  sparse?: boolean;
  Id?: string;
  SyncToken?: string;
  MetaData?: {
    CreateTime: string;
    LastUpdatedTime: string;
  };
  CustomField?: Array<QbcustomField>;
  DocNumber?: string;
  TxnDate?: string;
  CurrencyRef?: {
    value: string;
    name: string;
  };
  LinkedTxn?: Array<LinkedTxn>;
  TxnTaxDetail?: {
    TxnTaxCodeRef: {
      value: string;
    };
    TotalTax?: number;
    /**
     * Only used for tax codes that are split into different amounts
     */
    TaxLine?: Array<TaxLine>;
  };
  Balance?: number;
  DueDate?: string;
  TotalAmt?: number;
  ApplyTaxAfterDiscount?: boolean;
  PrintStatus?: "NeedToPrint";
  EmailStatus?: "NotSet" | "NeedToSend" | "EmailSent";
  BillEmail: BillEmail
  /**
   * @description allow voiding an invoice
   */
  void?: boolean;
  Notes?: string;
  CustomerMemo?: {
    value: string;
  };
  ClassRef: {
    value: string;
    name?: string;
  },
  AutoDocNumber?: boolean;
}

export type TaxLine = {
  Amount?: number;
  DetailType: "TaxLineDetail";
  TaxLineDetail: {
    TaxRateRef: {
      value: string;
    };
    PercentBased?: boolean;
    TaxPercent?: number;
    NetAmountTaxable: number;
  };
};

export type ItemLine = {
  LineNum?: number;
  Description?: string;
  Amount: number;
  DetailType: "SalesItemLineDetail";
  SalesItemLineDetail: {
    ItemRef: {
      value: string;
      name: string;
    };
    UnitPrice: number;
    Qty: number;
    TaxCodeRef?: {
      value: "TAX" | string;
    };
  };
};
