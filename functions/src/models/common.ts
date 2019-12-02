import { firestore } from "firebase-admin";

export interface jengaipnmodel {
  customer: {
    name: string;
    mobileNumer: string;
    reference: string;
  };
  transaction: {
    date: string;
    reference: string;
    paymentMode: string;
    amount: string;
    till: string;
    billNumber: string;
    serverdBy: string;
    additionalInfo: string;
  };
  bank: {
    reference: string;
    transactionType: string;
    account: string;
  };
  daudiFields: {
    companyid: string;
    sandbox: boolean;
    /**
     * 0 : empty company
     * 1 : unprocessed
     * 2 : complete
     * 3 : error
     * 48 : special code to tell cloud functions to process the payment
     */
    status: 0 | 1 | 2 | 3 | 48;
    errordetail?: any;
    approvedby?: User;
    bank: "equity" | "kcb";
  };
}

export interface ipnmodel {
  billNumber: string;
  billAmount: number;
  currencyCode: "KES";
  customerRefNumber: number;
  bankreference: string;
  tranParticular: string;
  paymentMode: string;
  phonenumber: number;
  debitaccount: number;
  debitcustname: string;
  passwowrd: string;
  username: string;
  transactionDate: Date;
  daudiFields: {
    companyid: string;
    sandbox: boolean;
    /**
     * 0 : empty company
     * 1 : unprocessed
     * 2 : complete
     * 3 : error
     * 48 : special code to tell cloud functions to process the payment
     */
    status: 0 | 1 | 2 | 3 | 48;
    error?: any;
    errordetail?: any;
    approvedby?: User;
    bank: "equity" | "kcb";
  };
}

export type QbTypes =
  | "Account"
  | "Attachable"
  | "Batch"
  | "Bill"
  | "BillPayment"
  | "Budget"
  | "ChangeDataCapture"
  | "Class"
  | "CompanyInfo"
  | "CreditMemo"
  | "Customer"
  | "Department"
  | "Deposit"
  | "Employee"
  | "Estimate"
  | "Invoice"
  | "Item"
  | "JournalEntry"
  | "Payment"
  | "PaymentMethod"
  | "Preferences"
  | "Purchase"
  | "PurchaseOrder"
  | "RefundReceipt"
  | "Reports"
  | "SalesReceipt"
  | "TaxAgency"
  | "TaxCode"
  | "TaxRate"
  | "TaxService"
  | "Term"
  | "TimeActivity"
  | "Transfer"
  | "Vendor"
  | "VendorCredit";

export type LinkedTxn = {
  TxnId: string;
  TxnType: QbTypes;
};

export const inituser = {
  name: "",
  time: firestore.Timestamp.fromDate(new Date()),
  uid: ""
};

export type User = {
  uid: string;
  name: string;
  time: firestore.Timestamp;
};

export type orderStages = "1" | "2" | "3" | "4" | "5" | "6";
export type fuelTypes = "pms" | "ago" | "ik";
