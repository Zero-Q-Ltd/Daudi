import { AssociatedUser } from "../Daudi/admin/AssociatedUser";
import { Bank } from "./Bank";

export interface DaudiPayment {
    Id: string;
    depositedBy: {
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
        servedBy: string;
        additionalInfo: string;
    };
    bank: {
        reference: string;
        transactionType: string;
        account: string;
        bank: Bank
    };
    daudiFields: {
        sandbox: boolean;
        status: paymentStatus;
        errordetail: {
            code: PaymentErrorCodes,
            error: string
        };
        approvedby: AssociatedUser | null;
    };
}
export enum paymentStatus {
    "empty company",
    'unprocessed',
    'complete',
    'error',
    'Processing' = 48
}

export enum PaymentErrorCodes {
    "Error Consolidating with Quickbooks"
} 