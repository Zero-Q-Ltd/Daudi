import { createQbo } from "../../../sharedqb";
import { Payment } from "../../../../models/Qbo/Payment";
import * as admin from "firebase-admin";
import * as moment from "moment";
import { Order } from "../../../../models/Daudi/order/Order";
import { QuickBooks } from "../../../../libs/qbmain";
import { Config } from "../../../../models/Daudi/omc/Config";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { OMC } from "../../../../models/Daudi/omc/OMC";
import { EmailStatus } from "../../../../models/Qbo/enums/EmailStatus";
import { Line } from "../../../../models/Qbo/subTypes/Line";
import { LineDetailType } from "../../../../models/Qbo/enums/LineDetailType";
import { Invoice } from "../../../../models/Qbo/Invoice";
import { FuelType } from '../../../../models/Daudi/fuel/FuelType';

function syncfueltypes(orderdata: Order, TxnTaxCodeRef: string): Array<any> {
    const values: Array<Line> = [];
    Object.keys(FuelType).forEach(key => {
        const fuel: FuelType = FuelType[key]
        if (orderdata.fuel[FuelType[fuel]].qty > 0) {
            values.push({
                Amount: orderdata.fuel[fuel].priceconfig.nonTaxprice * orderdata.fuel[fuel].qty,
                DetailType: LineDetailType.SalesItemLineDetail,
                Description: `VAT-Exempt : ${orderdata.fuel[fuel].priceconfig.nonTax} \t, Taxable Amount: ${orderdata.fuel[fuel].priceconfig.taxableAmnt} \t , VAT Total : ${orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
                SalesItemLineDetail: {
                    ItemRef: {
                        value: orderdata.fuel[fuel].QbId,
                        name: "Inventory"
                    },
                    UnitPrice: orderdata.fuel[fuel].priceconfig.nonTaxprice,
                    Qty: orderdata.fuel[fuel].qty,
                    TaxCodeRef: {
                        value: TxnTaxCodeRef
                    }
                }
            });
        }
    });
    return values;
}

function formulateInvoice(orderdata: Order, TxnTaxCodeRef: string, TaxRateRef: string): Invoice {
    const newInvoice: Invoice = {
        CustomField: [{
            DefinitionId: "2",
            Name: "Customer ID",
            StringValue: orderdata.customer.QbId,
            Type: "StringType"
        }],
        EmailStatus: EmailStatus.NeedToSend,
        CustomerRef: {
            value: orderdata.customer.QbId
        },
        BillEmail: {
            Address: orderdata.customer.contact[0].email
        },
        TxnTaxDetail: {
            TotalTax: orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt,
            TxnTaxCodeRef: {
                value: TxnTaxCodeRef
            },
            TaxLine: [{
                Amount: (orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt),
                DetailType: "TaxLineDetail",
                TaxLineDetail: {
                    NetAmountTaxable: orderdata.fuel.pms.priceconfig.taxableAmnt + orderdata.fuel.ago.priceconfig.taxableAmnt + orderdata.fuel.ik.priceconfig.taxableAmnt,
                    PercentBased: false,
                    TaxPercent: 8,
                    TaxRateRef: {
                        value: TaxRateRef
                    }
                }
            }]
        },
        ClassRef: {
            value: orderdata.QbConfig.classId
        },
        AutoDocNumber: true,
        domain: "QBO",
        Line: syncfueltypes(orderdata, TxnTaxCodeRef)
    };
    return newInvoice;
}

export function createInvoice(orderdata: Order, qbo: QuickBooks, config: Config, environment: Environment, omcId: string) {
    /**
     * format the timestamp again as it loses it when it doesnt directly go to the database
     */
    orderdata.stagedata["1"].user.time = moment().toDate() as any;

    console.log("Not new company, checking for pending payments");

    const newInvoice = formulateInvoice(orderdata, config.Qbo[environment].taxConfig.taxCode.Id, config.Qbo[environment].taxConfig.taxRate.Id);
    console.log(newInvoice);
    return qbo.createInvoice(newInvoice).then(innerresult => {
        const invoiceresult: Invoice = innerresult.Invoice;

        const Balance = innerresult.Invoice.Balance;
        if (Balance === 0) {
            console.log("Authorisation came from QB");
        }
        /**
         * Due to the limitation that you can't query payments by their unapplied amount, I will assume that the payment we are looking to link to this
         * Invoice is within the last 20 payments
         */
        return qbo.findPayments([
            { field: "CustomerRef", value: orderdata.customer.QbId, operator: "=" },
            { field: "limit", value: 20 }
        ]).then(value => {
            const queriedpayments = value.QueryResponse.Payment || [];
            let invoicefullypaid = false;
            const validpayments: Array<{ payment: Payment, amount: number }> = [];
            let totalunapplied = 0;

            queriedpayments.forEach(payment => {
                totalunapplied += payment.UnappliedAmt;
                if (totalunapplied < invoiceresult.TotalAmt) {
                    totalunapplied += payment.UnappliedAmt;
                    validpayments.push({
                        payment,
                        // amount: (totalunapplied < invoiceresult.TotalAmt ? payment.UnappliedAmt : totalunapplied - invoiceresult.TotalAmt)
                        amount: payment.UnappliedAmt
                    });
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
                const start = async () => {
                    await asyncForEach(validpayments, async (paymentdetial) => {
                        paymentdetial.payment.Line.push({
                            Amount: paymentdetial.amount,
                            LinkedTxn: [{
                                TxnId: invoiceresult.Id,
                                TxnType: "Invoice"
                            }]
                        });
                        await qbo.updatePayment(paymentdetial.payment);
                    });
                    console.log("Done updating payments");
                };
                return start().then(linkivoiceresult => {
                    const stagedata = {
                        data: null,
                        user: {
                            name: "QBO",
                            time: moment().toDate() as any,
                            uid: "QBO"
                        }
                    };
                    console.log(invoiceresult);
                    orderdata.stagedata[invoicefullypaid ? 3 : 2] = stagedata;
                    orderdata.QbConfig.QbId = invoiceresult.Id;
                    orderdata.QbConfig.InvoiceId = invoiceresult.DocNumber || null;
                    orderdata.stage = invoicefullypaid ? 3 : 2;
                    return admin.firestore().collection("omc")
                        .doc(omcId)
                        .collection("orders")
                        .doc(orderdata.Id)
                        .set(orderdata).then(() => {
                            console.log("success creating order");
                            if (orderdata.notifications.email) {
                                return qbo.sendInvoicePdf(invoiceresult.Id);
                            } else {
                                return ("not sending email");
                            }
                        });
                });
            } else {
                console.log("Company doesn't have unused payments");
                orderdata.QbConfig.QbId = invoiceresult.Id;
                orderdata.QbConfig.InvoiceId = invoiceresult.DocNumber || null;
                orderdata.stage = 2;

                return admin.firestore().collection("omc")
                    .doc(omcId)
                    .collection("orders")
                    .doc(orderdata.Id)
                    .set(orderdata).then(() => {
                        console.log("success creating order");
                        if (orderdata.notifications.email) {
                            return qbo.sendInvoicePdf(invoiceresult.Id);
                        } else {
                            return ("not sending email");
                        }
                    });
            }
        });
        /**
         * TODO: Complete logic that handles failures due to simultaneous access
         */
    })
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}
