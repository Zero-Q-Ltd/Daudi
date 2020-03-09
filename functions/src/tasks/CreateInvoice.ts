import { QuickBooks } from "../libs/qbmain";
import { QboCofig } from "../models/Cloud/QboEnvironment";
import { Order } from "../models/Daudi/order/Order";
import { Payment } from "../models/Qbo/Payment";
import { Invoice_Estimate } from "../models/Qbo/QboOrder";
import { validOrderUpdate } from "../validators/orderupdate";
import { updateOrder } from "./crud/daudi/Order";
import { QboOrder } from "./crud/qbo/Order/create";
import { ordersms } from "./sms/smscompose";
import { AssociatedUser } from "../models/Daudi/admin/AssociatedUser";

export function CreateInvoice(qbo: QuickBooks, config: QboCofig, omcId: string, order: Order) {
    return qbo.createInvoice(new QboOrder(order, config).QboOrder).then((createResult) => {
        /**
         * Only send sn SMS when invoice creation is complete
         */
        const InvoiceResult = createResult.Invoice as Invoice_Estimate;
        order.QbConfig.InvoiceId = InvoiceResult.Id;
        order.QbConfig.InvoiceNumber = InvoiceResult.DocNumber || null;
        order.stage = 2;

        console.log("result:", InvoiceResult);
        return qbo.findPayments([
            { field: "CustomerRef", value: order.customer.QbId, operator: "=" },
            { field: "limit", value: 20 }
        ]).then(value => {
            const queriedpayments = value.QueryResponse.Payment as Payment[] || [];
            const totalUnappliedPayments = queriedpayments.reduce((a, b) => a + Number(b.UnappliedAmt), 0);
            /**
             * Check if the inused payments are enough to fully pay for the just created invoice
             */
            console.log("Unappied:" + totalUnappliedPayments, "Invoice:" + InvoiceResult.TotalAmt, "Enough:", totalUnappliedPayments >= InvoiceResult.TotalAmt);
            if (totalUnappliedPayments >= InvoiceResult.TotalAmt) {
                console.log("Unused payments enough to pay for invoice");

                let unapplied = 0;
                /**
                 * variable to escape attaching payments to invoice
                 */
                let escapeLoop = false;

                /**
                 * serial process each payment so as to avoid concurrecy access errors from qbo
                 */
                queriedpayments.forEach(async payment => {
                    /**
                     * Escape early in case this payment has already been fully used
                     * This is neccessary because we cannt filter unused payments from qbo
                     */
                    if (payment.UnappliedAmt > 0) {
                        unapplied += payment.UnappliedAmt;
                        /**
                         * make sure we dont overpay
                         */
                        if (unapplied < InvoiceResult.TotalAmt) {
                            payment.Line.push({
                                Amount: payment.UnappliedAmt,
                                LinkedTxn: [{
                                    TxnId: InvoiceResult.Id,
                                    TxnType: "Invoice"
                                }]
                            });
                            await qbo.updatePayment(payment);
                        } else if (!escapeLoop) {
                            /**
                             * Only apply an the amount required to completely pay for the order
                             */
                            payment.Line.push({
                                Amount: unapplied - InvoiceResult.TotalAmt,
                                LinkedTxn: [{
                                    TxnId: InvoiceResult.Id,
                                    TxnType: "Invoice"
                                }]
                            });
                            escapeLoop = true;
                            await qbo.updatePayment(payment);
                        }
                    }

                });
                //move the order to the paid stage
                console.log("Done updating payments");
                order.stage = 3;
                order.orderStageData[3] = {
                    user: {
                        adminId: null,
                        date: new Date(),
                        name: "QBO"
                    }
                };

                return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId), updateOrder(order, omcId)]);
            } else if (totalUnappliedPayments > 0) {
                console.log("Not enough money to pay for invoice!!");
                /**
                 * serial process each payment so as to avoid concurrecy access errors from qbo
                 */
                queriedpayments.forEach(async payment => {
                    /**
                     * Since we're sure the total payments cannot exceed the invoice amount, then we're also sure the unapplied amount cannot, therefore apply 
                     * every available penny 
                     */
                    if (payment.UnappliedAmt > 0) {
                        payment.Line.push({
                            Amount: payment.UnappliedAmt,
                            LinkedTxn: [{
                                TxnId: InvoiceResult.Id,
                                TxnType: "Invoice"
                            }]
                        });
                    }
                    await qbo.updatePayment(payment);
                });
                console.log("Done updating payments");
                return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId), updateOrder(order, omcId)]);
            } else {
                console.log("Company doesn't have unused payments");
                return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId), updateOrder(order, omcId)]);
            }
        });
    });
}