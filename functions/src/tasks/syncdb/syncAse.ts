import { QuickBooks } from "../../libs/qbmain";
import { Bill } from "../../models/Qbo/Bill";
import * as moment from "moment";
import { firestore } from "firebase-admin";
import { Depot } from "../../models/Daudi/depot/Depot";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";
import { ASE } from "../../models/Daudi/fuel/ASE";

/**
 * 
 * @param qbo QBO Class containing valid auth tokens
 * @param fuelConfig COnfig having valid ID's
 * @param since 
 */
export function syncAse(qbo: QuickBooks, omcId: string, fuelConfig: { [key in FuelType]: FuelConfig }) {
    return qbo
        .findBills([
            /**
             * Get only the bills(Entries numbers) that have been fully paid
             */
            { field: "Balance", value: "1", operator: "<" },
            /**
           * fetch only bills that have been paid for Entry
           * Fetch all the fuel types at once
           */
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.pms.entryId, operator: "LIKE"
            // },
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.ago.entryId, operator: "LIKE"
            // },
            // {
            //     field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
            //     value: fuelConfig.ik.entryId, operator: "LIKE"
            // },
            { desc: "MetaData.LastUpdatedTime" },
            /**
             * Use the update time to compare with sync request time
             */
            {
                field: "TxnDate",
                value: moment()
                    .subtract(100, "day")
                    .startOf("day")
                    .format("YYYY-MM-DD"),
                operator: ">="
            }
        ])
        .then(billpayments => {
            const allbillpayment = (billpayments.QueryResponse.Bill as Array<Bill>) || [];

            let fueltype: FuelType
            /**
             * @todo allow the same bill to have mutiple fuel types
             */
            return Promise.all(allbillpayment.map(async bill => {
                if (bill.Line) {
                    const LineitemIndex = bill.Line.findIndex(t => {
                        if (t.ItemBasedExpenseLineDetail) {
                            {
                                if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.pms.aseId) {
                                    fueltype = FuelType.pms
                                    return true
                                } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ago.aseId) {
                                    fueltype = FuelType.ago
                                    return true
                                } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ik.aseId) {
                                    fueltype = FuelType.ik
                                    return true
                                } else {
                                    return false
                                }
                            }
                        } else {
                            return false
                        }
                    })

                    if (!LineitemIndex || LineitemIndex < 0) {
                        console.error("ITEM CONFIG NOT FOUND")
                        return true

                    }


                    const convertedASE = covertBillToASE(bill, fueltype, LineitemIndex);

                    const batchesdir = firestore()
                        .collection("omc")
                        .doc(omcId)
                        .collection("ase")

                    const fetchedbatch = await batchesdir.where("ase.id", "==", convertedASE.ase.id).get();
                    /**
                     * make sure the Entry doenst alread exist before writing to db
                     */
                    if (fetchedbatch.empty) {
                        console.log("creating new ASE");
                        /**
                         * Update the prices as well
                         */
                        return await batchesdir.add(convertedASE);
                    } else {
                        return false
                    }
                } else {
                    return false
                }
            }))
        });
}



function covertBillToASE(convertedBill: Bill, fueltype: FuelType, LineitemIndex: number): ASE {
    // console.log("converting bill to ASE");

    const ASEQty = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty ? convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty : 0;

    const newASE: ASE = {
        Amount: convertedBill.Line[LineitemIndex].Amount ? convertedBill.Line[LineitemIndex].Amount : 0,
        ase: {
            id: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
            refs: [{
                QbId: convertedBill.Id,
                qty: ASEQty
            }]
        },
        depot: {
            Id: null,
            name: null
        },
        Id: null,
        price: 0,
        qty: {
            directLoad: {
                accumulated: {
                    total: 0,
                    usable: 0
                },
                total: 0
            },
            total: ASEQty,
            transfered: {
                total: 0,
                transfers: []
            }
        },
        active: true,
        fuelType: fueltype,
        date: firestore.Timestamp.fromDate(new Date())
    };
    console.log(newASE)
    return newASE;
}
