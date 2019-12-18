// import { createQbo } from "../../../sharedqb";
import { Payment } from "../../../../models/Qbo/Payment";
import * as admin from "firebase-admin";
import * as moment from "moment";
import { Order } from "../../../../models/Daudi/order/Order";
import { QuickBooks } from "../../../../libs/qbmain";
import { Estimate } from "../../../../models/Qbo/Estimate";
import { PrintStatus } from "../../../../models/Qbo/enums/PrintStatus";
import { Config, QboEnvironment } from "../../../../models/Daudi/omc/Config";
import { Environment } from "../../../../models/Daudi/omc/Environments";
import { TxnStatus } from "../../../../models/Qbo/enums/TxnStatus";
import { EmailStatus } from "../../../../models/Qbo/enums/EmailStatus";
import { Line } from "../../../../models/Qbo/subTypes/Line";
import { LineDetailType } from "../../../../models/Qbo/enums/LineDetailType";
import { FuelType, FuelNamesArray } from '../../../../models/Daudi/fuel/FuelType';
import { FuelConfig } from "../../../../models/Daudi/omc/FuelConfig";
import { Invoice } from '../../../../models/Qbo/Invoice';


export class createInvoice {

    orderdata: Order;
    qbo: QuickBooks;
    config: Config;
    environment: Environment;
    constructor(_orderdata: Order, _qbo: QuickBooks, _config: Config, environment: Environment) {
        /**
    * format the timestamp again as it loses it when it doesnt directly go to the database
    */
        _orderdata.stagedata["1"].user.time = moment().toDate() as any;
        this.orderdata = _orderdata;
        this.qbo = _qbo;
        this.config = _config;
        this.environment = environment
    }

    syncfueltypes(): Array<any> {
        const values: Array<Line> = [];
        FuelNamesArray.forEach(fuel => {
            if (this.orderdata.fuel[fuel].qty > 0) {
                values.push({
                    Amount: this.orderdata.fuel[fuel].priceconfig.nonTaxprice * this.orderdata.fuel[fuel].qty,
                    DetailType: LineDetailType.GroupLineDetail,
                    Description: `VAT-Exempt : ${this.orderdata.fuel[fuel].priceconfig.nonTax} \t Taxable Amount: ${this.orderdata.fuel[fuel].priceconfig.taxableAmnt} \t VAT Total : ${this.orderdata.fuel[fuel].priceconfig.taxAmnt} \t`,
                    Id: this.config.Qbo[this.environment].fuelconfig[fuel].groupId,
                    GroupLineDetail: {
                        Quantity: this.orderdata.fuel[fuel].qty,
                        GroupItemRef: {
                            name: fuel,
                            value: this.config.Qbo[this.environment].fuelconfig[fuel].groupId
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
                                Id: this.config.Qbo[this.environment].fuelconfig[fuel].aseId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.Qbo[this.environment].fuelconfig[fuel].aseId
                                    },
                                    Qty: this.orderdata.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: this.config.Qbo[this.environment].taxConfig.taxCode.Id
                                    },
                                    UnitPrice: this.orderdata.fuel[fuel].priceconfig.nonTaxprice
                                }
                            },
                            {
                                Amount: 0,
                                Description: "",
                                DetailType: LineDetailType.SalesItemLineDetail,
                                Id: this.config.Qbo[this.environment].fuelconfig[fuel].entryId,
                                SalesItemLineDetail: {
                                    ItemRef: {
                                        name: fuel,
                                        value: this.config.Qbo[this.environment].fuelconfig[fuel].entryId
                                    },
                                    Qty: this.orderdata.fuel[fuel].qty,
                                    TaxCodeRef: {
                                        value: this.config.Qbo[this.environment].taxConfig.taxCode.Id
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

    formulateInvoice(): Invoice {
        const newEstimate: Invoice = {
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
                    value: this.config.Qbo[this.environment].taxConfig.taxCode.Id
                },
                TaxLine: [{
                    Amount: (this.orderdata.fuel.pms.priceconfig.taxAmnt + this.orderdata.fuel.ago.priceconfig.taxAmnt + this.orderdata.fuel.ik.priceconfig.taxAmnt),
                    DetailType: "TaxLineDetail",
                    TaxLineDetail: {
                        NetAmountTaxable: this.orderdata.fuel.pms.priceconfig.taxableAmnt + this.orderdata.fuel.ago.priceconfig.taxableAmnt + this.orderdata.fuel.ik.priceconfig.taxableAmnt,
                        PercentBased: false,
                        TaxPercent: 8,
                        TaxRateRef: {
                            value: this.config.Qbo[this.environment].taxConfig.taxRate.Id
                        }
                    }
                }]
            },
            domain: "QBO",
            ClassRef: {
                name: this.orderdata.config.depot.name,
                value: this.orderdata.QbConfig.departmentId
            },
            // TxnStatus: TxnStatus.Pending,
            PrintStatus: PrintStatus.NeedToPrint,

            Line: this.syncfueltypes()
        };
        return newEstimate;
    }

}
