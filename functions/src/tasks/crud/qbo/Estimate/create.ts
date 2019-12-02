import { Invoice, ItemLine } from "../../../../models/Qbo/Invoice";
import { createQbo } from "../../../sharedqb";
import { Payment } from "../../../../models/Qbo/Payment";
import * as admin from "firebase-admin";
import * as moment from "moment";
import { fuelTypes } from "../../../../models/common";
import { Order } from "../../../../models/Daudi/order/Order";
import { QuickBooks } from "../../../../libs/qbmain";
import { Estimate } from "../../../../models/Qbo/Estimate";
import { Config } from "../../../../models/Daudi/omc/Config";
import { Environment } from "../../../../models/Daudi/omc/Environments";

function syncfueltypes(orderdata: Order): Array<any> {
    const fuels = ["pms", "ago", "ik"];
    const values: Array<ItemLine> = [];
    fuels.forEach(fuel => {
        if (orderdata.fuel[fuel].qty > 0) {
            values.push({
                Amount: orderdata.fuel[fuel].priceconfig.nonTaxprice * orderdata.fuel[fuel].qty,
                DetailType: "SalesItemLineDetail",
                Description: `VAT-Exempt : ${orderdata.fuel[fuel].priceconfig.nonTax} \t, Taxable Amount: ${orderdata.fuel[fuel].priceconfig.taxableAmnt} \t , VAT Total : ${orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
                SalesItemLineDetail: {
                    ItemRef: {
                        value: orderdata.fuel[fuel].QbId,
                        name: "Inventory"
                    },
                    UnitPrice: orderdata.fuel[fuel].priceconfig.nonTaxprice,
                    Qty: orderdata.fuel[fuel].qty,
                    TaxCodeRef: {
                        value: orderdata.config.sandbox ? "TAX" : "5"
                    }
                }
            });
        }
    });
    return values;
}

function formulateEstimate(orderdata: Order): Estimate {
    const newEstimate: Estimate = {
        Balance: 0,
        TotalAmt: 0,
        CustomField: [{
            DefinitionId: "1",
            Name: "[Do not Edit!]",
            StringValue: `${orderdata.config.depot.Id}/${orderdata.Id}`,
            Type: "StringType"
        }, {
            DefinitionId: "2",
            Name: "Customer ID",
            StringValue: orderdata.customer.QbId,
            Type: "StringType"
        }],
        EmailStatus: "NeedToSend",
        CustomerRef: {
            value: orderdata.customer.QbId
        },
        BillEmail: {
            Address: orderdata.customer.email
        },
        TxnTaxDetail: {
            TotalTax: orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt,
            TxnTaxCodeRef: {
                value: orderdata.config.sandbox ? "TAX" : "5"
            },
            TaxLine: [{
                Amount: (orderdata.fuel.pms.priceconfig.taxAmnt + orderdata.fuel.ago.priceconfig.taxAmnt + orderdata.fuel.ik.priceconfig.taxAmnt),
                DetailType: "TaxLineDetail",
                TaxLineDetail: {
                    NetAmountTaxable: orderdata.fuel.pms.priceconfig.taxableAmnt + orderdata.fuel.ago.priceconfig.taxableAmnt + orderdata.fuel.ik.priceconfig.taxableAmnt,
                    PercentBased: false,
                    TaxPercent: 8,
                    TaxRateRef: {
                        value: orderdata.config.sandbox ? '5' : '9'
                    }
                }
            }]
        },
        AutoDocNumber: true,
        Line: syncfueltypes(orderdata)
    };
    /**
     * very bad temporary error
     */
    delete newEstimate.Balance
    delete newEstimate.TotalAmt
    return newEstimate;
}

export function createEstimate(orderdata: Order, qbo: QuickBooks, config: Config, environment: Environment) {
    /**
     * format the timestamp again as it loses it when it doesnt directly go to the database
     */
    orderdata.stagedata["1"].user.time = moment().toDate() as any;

    console.log("Not new company, checking for pending payments");

    const newInvoice = formulateEstimate(orderdata);
    console.log(newInvoice);
    return qbo.createEstimate(newInvoice)
}