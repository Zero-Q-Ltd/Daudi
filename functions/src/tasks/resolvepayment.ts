import { firestore } from "firebase-admin";
import * as moment from "moment";
import { LineItems, Payment } from "../models/Qbo/Payment";
import { Invoice_Estimate } from "../models/Qbo/QboOrder";
import { createQbo } from "./sharedqb";
import {
  DaudiPayment,
  paymentStatus,
  PaymentErrorCodes,
} from "../models/payment/DaudiPayment";
import { QuickBooks } from "../libs/qbmain";
import { GenericStage } from "../models/Daudi/order/GenericStage";
import { paymentDoc } from "./crud/daudi/Paymnet";
import { orderDoc, orderCollection } from "./crud/daudi/Order";
import { toArray, toObject } from "../models/utils/SnapshotUtils";
import { emptyorder } from "../models/Daudi/order/Order";

export function resolvePayment(
  payment: DaudiPayment,
  qbo: QuickBooks,
  omcId: string
): Promise<any> {
  console.log(payment);
  const customerId = payment.transaction.billNumber;

  if (payment.daudiFields.status === 0) {
    return Promise.resolve("Ignoring payment lacking customerId");
  } else {
    /**
     * Sort the invoices by the creation time so that there's a FIFO order
     */
    return qbo
      .findInvoices([
        { field: "CustomerRef", value: customerId, operator: "=" },
        { field: "Balance", value: "0", operator: ">" },
        { asc: "MetaData.CreateTime" },
      ])
      .then((invoicesresult) => {
        /**
         * initialize the array in case empty
         */
        const allpendinginvoices: Array<Invoice_Estimate> =
          invoicesresult.QueryResponse.Invoice || [];
        console.log(
          `Customer has ${allpendinginvoices.length} pending invoices`
        );
        /**
         * Make sure that we dont link more invoices to the amount than applicable
         */
        let applicableInvoicesTotal = 0;

        const applicableInvoices: Array<Invoice_Estimate> = allpendinginvoices.filter(
          (invoice, index) => {
            if (applicableInvoicesTotal <= Number(payment.transaction.amount)) {
              applicableInvoicesTotal += invoice.Balance;
              return true;
            } else if (index === 0) {
              /**
               * Apply if there's only one invoice
               */
              console.log("Applying to Only 1 invoice");
              applicableInvoicesTotal += invoice.Balance;
              return true;
            } else {
              return false;
            }
          }
        );

        console.log(
          `Customer has ${applicableInvoices.length} applicable invoices`
        );

        /**
         * Keep an array of the result status of every Applicable invoice after paymnet has been applied
         */
        const invoiceValues: {
          invoiceId: string;
          amountPaid: number;
          invoiceAmount: number;
        }[] = [];
        if (applicableInvoices.length > 0) {
          /**
           * Local var keeping the total amount that has been applied while looping
           */
          let appliedamount = 0;
          const qboPayment: Payment = {
            PaymentRefNum: payment.transaction.reference,
            CustomerRef: {
              value: customerId,
              name: payment.depositedBy.name,
            },
            /**
             * Loop through the applicable invoices and deduce how much is to be applied from the payment
             */
            Line: applicableInvoices.map((invoice, index) => {
              let amountToapply = 0;
              if (
                invoice.Balance <=
                Number(payment.transaction.amount) - appliedamount
              ) {
                amountToapply = invoice.Balance;
                appliedamount += amountToapply;
                /**
                 * mark the invoice as fully paid
                 */
                invoiceValues[index] = {
                  invoiceId: String(invoice.Id),
                  amountPaid: amountToapply,
                  invoiceAmount: invoice.Balance,
                };
                //
              } else {
                amountToapply =
                  Number(payment.transaction.amount) - appliedamount;
                appliedamount += amountToapply;
                /**
                 * mark this as a partial payment
                 */
                invoiceValues[index] = {
                  invoiceId: String(invoice.Id),
                  amountPaid: amountToapply,
                  invoiceAmount: invoice.Balance,
                };
              }
              const line: LineItems = {
                Amount: amountToapply,
                LinkedTxn: [
                  {
                    TxnId: invoice.Id || "",
                    TxnType: "Invoice",
                  },
                ],
              };
              return line;
            }),
            TotalAmt: Number(payment.transaction.amount),
          };
          return qbo.createPayment(qboPayment).then((res) => {
            const paymentResult = res.Payment.Line;
            if (!paymentResult) {
              console.error("Payment not sucessful");
              payment.daudiFields.status = paymentStatus.error;
              payment.daudiFields.errordetail = {
                code: PaymentErrorCodes["Error Consolidating with Quickbooks"],
                error: "Unknown error details",
              };
              return paymentDoc(omcId, payment.Id).update(payment);
            }
            const batch = firestore().batch() as any;
            /**
             * Loop through the payment results and conditionally move the orders to paid in Daudi
             */
            const readPromises = invoiceValues.map((val) => {
              return orderCollection(omcId)
                .where("QbConfig.InvoiceId", "==", val.invoiceId)
                .get();
            });

            return Promise.all(readPromises).then((orderDocs) => {
              const orders = orderDocs.map((d) =>
                toObject(emptyorder, d.docs[0])
              );
              console.log(orders);
              orders.forEach((order) => {
                if (!order) {
                  console.log("Ignoring order created outside DAUDI");
                  return;
                }
                const matchingInvoice = invoiceValues.find(
                  (v) => v.invoiceId === order.QbConfig.InvoiceId
                );
                const stagedata: GenericStage = {
                  user: {
                    name: "QBO",
                    date: moment().toDate(),
                    adminId: null,
                  },
                };
                if (
                  matchingInvoice.amountPaid === matchingInvoice.invoiceAmount
                ) {
                  order.stage = 3;
                  order.orderStageData[3] = stagedata;
                  order.paymentDetail[payment.Id] = matchingInvoice.amountPaid;
                  batch.update(orderDoc(order.Id, omcId), order);
                } else {
                  batch.update(orderDoc(order.Id, omcId), {
                    [`paymentDetail.${payment.Id}`]: matchingInvoice.amountPaid,
                  });
                }
              });
              return batch.commit();
            });
          });
        } else {
          const unappliedPayment: Payment = {
            PaymentRefNum: payment.transaction.reference,
            CustomerRef: {
              value: customerId,
              name: payment.depositedBy.name,
            },
            Line: [],
            TotalAmt: Number(payment.transaction.amount),
          };
          return qbo.createPayment(unappliedPayment).then(() => {
            payment.daudiFields.status = paymentStatus.complete;
            return paymentDoc(omcId, payment.Id).update(payment);
          });
        }
      });
  }
}
