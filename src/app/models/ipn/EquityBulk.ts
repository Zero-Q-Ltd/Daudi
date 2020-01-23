import {AssociatedUser} from '../Daudi/admin/AssociatedUser';

export interface EquityBulk {
  billNumber: string;
  billAmount: number;
  currencyCode: 'KES';
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
    approvedby?: AssociatedUser;
    bank: 'equity' | 'kcb';
  };
}
