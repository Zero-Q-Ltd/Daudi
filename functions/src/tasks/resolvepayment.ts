import { firestore } from "firebase-admin";
import * as moment from "moment";
import { LineItems, Payment } from "../models/Qbo/Payment";
import { QboOrder } from "../models/Qbo/QboOrder";
import { createQbo } from "./sharedqb";
import { DaudiPayment, paymentStatus, PaymentErrorCodes } from "../models/ipn/DaudiPayment";
import { QuickBooks } from "../libs/qbmain";
import { GenericStage } from "../models/Daudi/order/GenericStage";
import { PaymentDoc } from "./crud/daudi/Paymnet";
import { orderDoc } from "./crud/daudi/Order";

export function resolvePayment(payment: DaudiPayment, qbo: QuickBooks, omcId: string): Promise<any> {
    // console.log(ipndetail);
    const proddbstring = "prodpayments";
    const sandboxdbstring = "sandboxpayments";
    const customerid = payment.transaction.billNumber;

    if (payment.daudiFields.status === 0) {
        return new Promise(resolve => {
            resolve(true);
        });
    } else {
        /**
         * Sort the invoices by the creation time so that there's a FIFO order
         */
        return qbo
            .findInvoices([
                { field: "CustomerRef", value: customerid, operator: "=" },
                { field: "Balance", value: "0", operator: ">" },
                { asc: "MetaData.CreateTime" }
            ])
            .then(async invoicesresult => {
                /**
                 * initialize the array in case empty
                 */
                const allpendinginvoices: Array<QboOrder> = invoicesresult.QueryResponse.QboOrder || [];
                console.log(`Customer has ${allpendinginvoices.length} pending invoices`);
                /**
                 * Make sure that we dont link more invoices to the amount than applicable
                 */
                let applicableInvoicesTotal = 0;

                const applicableInvoices: Array<QboOrder> = allpendinginvoices.filter(invoice => {
                    if (applicableInvoicesTotal <= Number(payment.transaction.amount)) {
                        applicableInvoicesTotal += invoice.Balance;
                        return true
                    } else {
                        return false
                    }
                });

                console.log(`Customer has ${applicableInvoices.length} applicable invoices`);

                /**
                 * Keep an array of the result status of every Applicable invoice after paymnet has been applied
                 */
                const invoiceValues: {
                    orderId: string;
                    amountPaid: number,
                    invoiceAmount: number
                }[] = []
                if (applicableInvoices.length > 0) {
                    /**
                     * Local var keeping the total amount that has been applied while looping
                     */
                    let appliedamount = 0;
                    const qboPayment: Payment = {
                        PaymentRefNum: payment.transaction.reference,
                        CustomerRef: {
                            value: customerid,
                            name: payment.depositedBy.name
                        },
                        /**
                         * Loop through the applicable invoices and deduce how much is to be applied from the payment
                         */
                        Line: applicableInvoices.map((invoice, index) => {
                            let amountToapply = 0;
                            if (invoice.Balance <= Number(payment.transaction.amount) - appliedamount) {
                                amountToapply = invoice.Balance;
                                appliedamount += amountToapply;
                                /**
                                 * mark the invoice as fully paid
                                 */
                                invoiceValues[index] = {
                                    orderId: invoice.Id,
                                    amountPaid: amountToapply,
                                    invoiceAmount: invoice.Balance
                                }
                            } else {
                                amountToapply = Number(payment.transaction.amount) - appliedamount;
                                appliedamount += amountToapply;
                                /**
                                 * mark this as a partial payment
                                 */
                                invoiceValues[index] = {
                                    orderId: invoice.Id,
                                    amountPaid: amountToapply,
                                    invoiceAmount: invoice.Balance
                                }
                            }
                            const line: LineItems = {
                                Amount: amountToapply,
                                LinkedTxn: [
                                    {
                                        TxnId: invoice.Id || '',
                                        TxnType: "Invoice"
                                    }
                                ]
                            };
                            return line;
                        }),
                        TotalAmt: Number(payment.transaction.amount)
                    };
                    const paymentResult = await qbo.createPayment(qboPayment).then(res => res.Payment.Line)
                    if (!paymentResult) {
                        console.error("Payment not sucessful");
                        payment.daudiFields.status = paymentStatus.error
                        payment.daudiFields.errordetail = {
                            code: PaymentErrorCodes["Error Consolidating with Quickbooks"],
                            error: "Unknown error details"
                        }
                        return PaymentDoc(omcId, payment.Id).update(payment)
                    }
                    const batch = firestore().batch();
                    /**
                     * Loop through the payment results and conditionally move the orders to paid in Daudi
                     */
                    invoiceValues.forEach(val => {
                        const stagedata: GenericStage = {
                            user: {
                                name: "QBO",
                                date: moment().toDate(),
                                adminId: null
                            }
                        };
                        /**
                         * Only update the stage if the order has been fully paid
                         * Connect this payment to the applied invoices within DAUDI
                         */
                        if (val.amountPaid === val.amountPaid) {
                            batch.update(orderDoc(val.orderId, omcId), {
                                stage: 3,
                                [`stagedata.${3}`]: stagedata,
                                [`paymentDetail.${payment.Id}`]: val.amountPaid
                            })
                        } else {
                            batch.update(orderDoc(val.orderId, omcId), {
                                [`paymentDetail.${payment.Id}`]: val.amountPaid
                            })
                        }
                    })
                    return batch.commit()

                } else {
                    const unappliedPayment: Payment = {

                        PaymentRefNum: payment.transaction.reference,
                        CustomerRef: {
                            value: customerid,
                            name: payment.depositedBy.name
                        },
                        Line: [],
                        TotalAmt: Number(payment.transaction.amount)
                    };
                    return qbo.createPayment(unappliedPayment).then(() => {
                        payment.daudiFields.status = paymentStatus.complete;
                        return PaymentDoc(omcId, payment.Id).update(payment)
                    });
                }
            });

    }
}