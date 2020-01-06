import * as moment from "moment";
import {QuickBooks} from "../../../../libs/qbmain";
import {FuelNamesArray} from '../../../../models/Daudi/fuel/FuelType';
import {OMCConfig} from "../../../../models/Daudi/omc/Config";
import {Order} from "../../../../models/Daudi/order/Order";
import {EmailStatus} from "../../../../models/Qbo/enums/EmailStatus";
import {LineDetailType} from "../../../../models/Qbo/enums/LineDetailType";
import {PrintStatus} from "../../../../models/Qbo/enums/PrintStatus";
import {TxnStatus} from "../../../../models/Qbo/enums/TxnStatus";
import {Estimate} from "../../../../models/Qbo/Estimate";
import {Line} from "../../../../models/Qbo/subTypes/Line";


export class createEstimate {

    orderdata: Order;
    qbo: QuickBooks;
    config: OMCConfig;
    constructor(_orderdata: Order, _qbo: QuickBooks, _config: OMCConfig) {
        /**
    * format the timestamp again as it loses it when it doesnt directly go to the database
    */
        _orderdata.stagedata["1"].user.time = moment().toDate() as any;
        this.orderdata = _orderdata;
        this.qbo = _qbo;
        this.config = _config;
    }

    syncfueltypes(): Array<any> {
        const values: Array<Line> = [];
        FuelNamesArray.forEach(fuel => {
            if (this.orderdata.fuel[fuel].qty > 0) {
                values.push({
                    Amount: this.orderdata.fuel[fuel].priceconfig.nonTaxprice * this.orderdata.fuel[fuel].qty,
                    DetailType: LineDetailType.GroupLineDetail,
                    Description: `VAT-Exempt : ${this.orderdata.fuel[fuel].priceconfig.nonTax} \t Taxable Amount: ${this.orderdata.fuel[fuel].priceconfig.taxableAmnt} \t VAT Total : ${this.orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
                    Id: this.config.Qbo.fuelconfig[fuel].groupId,
                    GroupLineDetail: {
                        Quantity: this.orderdata.fuel[fuel].qty,
                        GroupItemRef: {
                            name: fuel,
                            value: this.config.Qbo.fuelconfig[fuel].groupId
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
                                Id: this.config.Qbo.fuelconfig[fuel].aseId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.Qbo.fuelconfig[fuel].aseId
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
                                Id: this.config.Qbo.fuelconfig[fuel].entryId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.Qbo.fuelconfig[fuel].entryId
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

    formulateEstimate(): Estimate {
        const newEstimate: Estimate = {
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
                    value: this.config.Qbo.taxConfig.taxCode.Id
                },
                TaxLine: [{
                    Amount: (this.orderdata.fuel.pms.priceconfig.taxAmnt + this.orderdata.fuel.ago.priceconfig.taxAmnt + this.orderdata.fuel.ik.priceconfig.taxAmnt),
                    DetailType: "TaxLineDetail",
                    TaxLineDetail: {
                        NetAmountTaxable: this.orderdata.fuel.pms.priceconfig.taxableAmnt + this.orderdata.fuel.ago.priceconfig.taxableAmnt + this.orderdata.fuel.ik.priceconfig.taxableAmnt,
                        PercentBased: false,
                        TaxPercent: 8,
                        TaxRateRef: {
                            value: this.config.Qbo.taxConfig.taxRate.Id
                        }
                    }
                }]
            },
            domain: "QBO",
            TxnStatus: TxnStatus.Pending,
            PrintStatus: PrintStatus.NeedToPrint,
            DepartmentRef: {
                name: this.orderdata.config.depot.name,
                value: this.orderdata.QbConfig.departmentId
            },

            Line: this.syncfueltypes()
        };

        return newEstimate;
    }
}
