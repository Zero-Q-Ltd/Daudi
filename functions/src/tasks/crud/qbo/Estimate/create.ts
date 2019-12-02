import { createQbo } from "../../../sharedqb";
import { Payment } from "../../../../models/Qbo/Payment";
import * as admin from "firebase-admin";
import * as moment from "moment";
import { fuelTypes } from "../../../../models/common";
import { Order } from "../../../../models/Daudi/order/Order";
import { QuickBooks } from "../../../../libs/qbmain";
import { Estimate } from "../../../../models/Qbo/Estimate";
import { PrintStatus } from "../../../../models/Qbo/enums/PrintStatus";
import { Config } from "../../../../models/Daudi/omc/Config";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { TxnStatus } from "../../../../models/Qbo/enums/TxnStatus";
import { EmailStatus } from "../../../../models/Qbo/enums/EmailStatus";
import { Line } from "../../../../models/Qbo/subTypes/Line";
import { LineDetailType } from "../../../../models/Qbo/enums/LineDetailType";

function syncfueltypes(orderdata: Order, TxnTaxCodeRef: string): Array<any> {
    const fuels = ["pms", "ago", "ik"];
    const values: Array<Line> = [];
    fuels.forEach(fuel => {
        if (orderdata.fuel[fuel].qty > 0) {
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

function formulateEstimate(orderdata: Order, TxnTaxCodeRef: string, TaxRateRef: string): Estimate {
    const newEstimate: Estimate = {
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
        domain: "QBO",
        TxnStatus: TxnStatus.Pending,
        PrintStatus: PrintStatus.NeedToPrint,

        Line: syncfueltypes(orderdata, TxnTaxCodeRef)
    };

    return newEstimate;
}

export function createEstimate(orderdata: Order, qbo: QuickBooks, config: Config, environment: Environment) {
    /**
     * format the timestamp again as it loses it when it doesnt directly go to the database
     */
    orderdata.stagedata["1"].user.time = moment().toDate() as any;

    console.log("Not new company, checking for pending payments");

    const newInvoice = formulateEstimate(orderdata, config.Qbo[environment].taxConfig.taxCode.Id, config.Qbo[environment].taxConfig.taxRate.Id);
    console.log(newInvoice);
    return qbo.createEstimate(newInvoice)
}