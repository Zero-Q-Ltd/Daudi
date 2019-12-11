import { AssociatedUser } from "../Daudi/admin/AssociatedUser";
export interface Jenga {
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
        approvedby?: AssociatedUser;
        bank: "equity" | "kcb";
    };
}
