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


export class createQboOrder {
    constructor(private orderdata: Order, private config: QboCofig) {
        /**
         * format the timestamp again as it loses it when it doesnt directly go to the database
         */
        orderdata.orderStageData["1"].user.date = moment().toDate() as any;

    }

    syncfueltypes(): Array<any> {
        const values: Array<Line> = [];
        FuelNamesArray.forEach(fuel => {
            if (this.orderdata.fuel[fuel].qty > 0) {
                values.push({
                    Amount: this.orderdata.fuel[fuel].priceconfig.nonTaxprice * this.orderdata.fuel[fuel].qty,
                    DetailType: LineDetailType.GroupLineDetail,
                    Description: `VAT-Exempt : ${this.orderdata.fuel[fuel].priceconfig.nonTax} \t Taxable Amount: ${this.orderdata.fuel[fuel].priceconfig.taxableAmnt} \t VAT Total : ${this.orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
                    Id: this.config.fuelconfig[fuel].groupId,
                    GroupLineDetail: {
                        Quantity: this.orderdata.fuel[fuel].qty,
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
                                Amount: this.orderdata.fuel[fuel].priceconfig.nonTaxprice * this.orderdata.fuel[fuel].qty,
                                Description: "",
                                DetailType: LineDetailType.SalesItemLineDetail,
                                Id: this.config.fuelconfig[fuel].aseId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.fuelconfig[fuel].aseId
                                    },
                                    Qty: this.orderdata.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: "TAX"
                                    },
                                    UnitPrice: this.orderdata.fuel[fuel].priceconfig.nonTaxprice
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
                                    Qty: this.orderdata.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: "NON"
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

    formulate(): QboOrder {
        const newEstimate: QboOrder = {
            CustomField: [{
                DefinitionId: "1",
                Name: "Customer ID",
                StringValue: this.orderdata.customer.QbId,
                Type: "StringType"
            }],
            EmailStatus: EmailStatus.NeedToSend,
            CustomerRef: {
                value: this.orderdata.customer.QbId
            },
            BillEmail: {
                Address: this.orderdata.customer.contact[0].email
            },
            TxnTaxDetail: {
                TotalTax: this.orderdata.fuel.pms.priceconfig.taxAmnt + this.orderdata.fuel.ago.priceconfig.taxAmnt + this.orderdata.fuel.ik.priceconfig.taxAmnt,
                TxnTaxCodeRef: {
                    value: this.config.taxConfig.taxCode.Id
                },
                TaxLine: [{
                    Amount: (this.orderdata.fuel.pms.priceconfig.taxAmnt + this.orderdata.fuel.ago.priceconfig.taxAmnt + this.orderdata.fuel.ik.priceconfig.taxAmnt),
                    DetailType: "TaxLineDetail",
                    TaxLineDetail: {
                        NetAmountTaxable: this.orderdata.fuel.pms.priceconfig.taxableAmnt + this.orderdata.fuel.ago.priceconfig.taxableAmnt + this.orderdata.fuel.ik.priceconfig.taxableAmnt,
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
                name: this.orderdata.config.depot.name,
                value: this.orderdata.QbConfig.departmentId
            },
            Line: this.syncfueltypes()
        };

        return newEstimate;
    }
}
