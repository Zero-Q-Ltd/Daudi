import * as moment from "moment";
import { QuickBooks } from "../../../../libs/qbmain";
import { FuelNamesArray } from '../../../../models/Daudi/fuel/FuelType';
import { Order } from "../../../../models/Daudi/order/Order";
import { EmailStatus } from "../../../../models/Qbo/enums/EmailStatus";
import { LineDetailType } from "../../../../models/Qbo/enums/LineDetailType";
import { PrintStatus } from "../../../../models/Qbo/enums/PrintStatus";
import { TxnStatus } from "../../../../models/Qbo/enums/TxnStatus";
import { Line } from "../../../../models/Qbo/subTypes/Line";
import { QboCofig } from "../../../../models/Cloud/QboEnvironment";
import { QboOrder } from "../../../../models/Qbo/QboOrder";
import { Payment } from "../../../../models/Qbo/Payment";


export class createQboOrder {
    QboOrder: QboOrder;
    constructor(private orderdata: Order, private config: QboCofig, linkPayments?: Payment[]) {
        /**
         * format the timestamp again as it loses it when it doesnt directly go to the database
         */
        this.orderdata.orderStageData["1"].user.date = moment().toDate() as any;
        this.QboOrder = this.formulate(this.orderdata);
    }

    private syncfueltypes(order: Order): Array<any> {
        const values: Array<Line> = [];
        FuelNamesArray.forEach(fuel => {
            if (order.fuel[fuel].qty > 0) {
                values.push({
                    Amount: order.fuel[fuel].priceconfig.nonTaxprice * order.fuel[fuel].qty,
                    DetailType: LineDetailType.GroupLineDetail,
                    Description: `VAT-Exempt : ${order.fuel[fuel].priceconfig.nonTax} \t Taxable Amount: ${order.fuel[fuel].priceconfig.taxableAmnt} \t VAT Total : ${order.fuel[fuel].priceconfig.taxAmnt} \t`,
                    Id: this.config.fuelconfig[fuel].groupId,
                    GroupLineDetail: {
                        Quantity: order.fuel[fuel].qty,
                        GroupItemRef: {
                            name: fuel,
                            value: this.config.fuelconfig[fuel].groupId
                        },
                        Line: [
                            /**
                             * There are 2 mandatory group items in every order: Ase and Emtry
                             * The entry component doesnt have an amount attached to it
                             */
                            {
                                Amount: order.fuel[fuel].priceconfig.nonTaxprice * order.fuel[fuel].qty,
                                Description: "",
                                DetailType: LineDetailType.SalesItemLineDetail,
                                Id: this.config.fuelconfig[fuel].aseId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.fuelconfig[fuel].aseId
                                    },
                                    Qty: order.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: this.config.taxConfig.taxCode.Id
                                    },
                                    UnitPrice: order.fuel[fuel].priceconfig.nonTaxprice
                                }
                            },
                            {
                                Amount: 0,
                                Description: "",
                                DetailType: LineDetailType.SalesItemLineDetail,
                                Id: this.config.fuelconfig[fuel].entryId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.fuelconfig[fuel].entryId
                                    },
                                    Qty: order.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: this.config.taxConfig.taxCode.Id
                                    },
                                    UnitPrice: 0
                                }
                            },

                        ]
                    }
                });
            }
        });
        return values;
    }

    private formulate(order: Order): QboOrder {
        const newEstimate: QboOrder = {
            CustomField: [{
                DefinitionId: "1",
                Name: "Customer ID",
                StringValue: order.customer.QbId,
                Type: "StringType"
            }],
            EmailStatus: EmailStatus.NeedToSend,
            CustomerRef: {
                value: order.customer.QbId
            },
            BillEmail: {
                Address: order.customer.contact[0].email
            },
            TxnTaxDetail: {
                TotalTax: order.fuel.pms.priceconfig.taxAmnt + order.fuel.ago.priceconfig.taxAmnt + order.fuel.ik.priceconfig.taxAmnt,
                // TxnTaxCodeRef: {
                //     value: this.config.taxConfig.taxCode.Id
                // },
                TaxLine: [{
                    Amount: (order.fuel.pms.priceconfig.taxAmnt + order.fuel.ago.priceconfig.taxAmnt + order.fuel.ik.priceconfig.taxAmnt),
                    DetailType: "TaxLineDetail",
                    TaxLineDetail: {
                        NetAmountTaxable: order.fuel.pms.priceconfig.taxableAmnt + order.fuel.ago.priceconfig.taxableAmnt + order.fuel.ik.priceconfig.taxableAmnt,
                        PercentBased: false,
                        TaxPercent: 8,
                        TaxRateRef: {
                            value: this.config.taxConfig.taxRate.Id
                        }
                    }
                }]
            },
            domain: "QBO",
            TxnStatus: TxnStatus.Pending,
            PrintStatus: PrintStatus.NeedToPrint,

            ClassRef: {
                name: order.config.depot.name,
                value: order.QbConfig.departmentId
            },
            Line: this.syncfueltypes(order)
        };
        console.log("Est", newEstimate);
        return newEstimate;
    }
}