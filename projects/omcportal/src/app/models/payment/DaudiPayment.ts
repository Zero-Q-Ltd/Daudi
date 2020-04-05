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
    "unprocessed",
    "complete",
    "error",
    "Processing" = 48
}

export enum PaymentErrorCodes {
    "Error Consolidating with Quickbooks"
}

export function emptyPayment(): DaudiPayment {
    return {
        Id: null,
        bank: {
            account: null,
            bank: null,
            reference: null,
            transactionType: null
        },
        daudiFields: {
            approvedby: null,
            errordetail: null,
            sandbox: true,
            status: null
        },
        depositedBy: {
            mobileNumer: null,
            name: null,
            reference: null,
        },
        transaction: {
            additionalInfo: null,
            amount: null,
            billNumber: null,
            date: null,
            paymentMode: null,
            reference: null,
            servedBy: null,
            till: null
        }
    }
}