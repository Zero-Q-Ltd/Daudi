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

        console.log("result:", InvoiceResult);
        // order.stage = 2;
        return qbo.findPayments([
            { field: "CustomerRef", value: order.customer.QbId, operator: "=" },
            { field: "limit", value: 20 }
        ]).then(value => {
            const queriedpayments = value.QueryResponse.Payment as Payment[] || [];
            let invoicefullypaid = false;
            const validpayments: Array<{ payment: Payment, amount: number; }> = [];
            let totalunapplied = 0;

            queriedpayments.forEach(payment => {
                totalunapplied += payment.UnappliedAmt;
                // console.log("Unapplied:", totalunapplied);
                if (totalunapplied < InvoiceResult.TotalAmt) {
                    if (payment.UnappliedAmt > 0) {
                        totalunapplied += payment.UnappliedAmt;
                        validpayments.push({
                            payment,
                            amount: payment.UnappliedAmt
                        });
                    } else {
                        console.log("Payment fully used up");
                        return;
                    }
                } else {
                    console.log("Unused payments enough to pay for invoice");
                    if (!invoicefullypaid) {
                        validpayments.push({
                            payment,
                            // amount: (totalunapplied < invoiceresult.TotalAmt ? payment.UnappliedAmt : totalunapplied - invoiceresult.TotalAmt)
                            amount: payment.UnappliedAmt
                        });
                        invoicefullypaid = true;
                    } else {
                        console.log("Accumulated unused payments already enough, skipping....");
                        return;
                    }
                }
            });

            if (validpayments.length > 0) {
                console.log(`Company has ${validpayments.length} unused payments`);
                // console.log(validpayments);
                /**
                  * This part needs to be blocking so that we dont get concurrency errors when
                  * Udating the same payment multiple times
                  */
                validpayments.forEach(async paymentdetial => {
                    paymentdetial.payment.Line.push({
                        Amount: paymentdetial.amount,
                        LinkedTxn: [{
                            TxnId: InvoiceResult.Id,
                            TxnType: "Invoice"
                        }]
                    });
                    return await qbo.updatePayment(paymentdetial.payment);
                });
                console.log("Done updating payments");
                const data: AssociatedUser = {
                    adminId: null,
                    date: new Date(),
                    name: "QBO"
                };
                if (invoicefullypaid) {
                    order.stage = 3;
                    order.orderStageData[3] = {
                        user: data
                    };
                }
                return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId), updateOrder(order, omcId)]);
            } else {
                console.log("Company doesn't have unused payments");
                order.stage = 2;
                return Promise.all([ordersms(order, omcId), validOrderUpdate(order, omcId), updateOrder(order, omcId)]);
            }
        });

    });
}