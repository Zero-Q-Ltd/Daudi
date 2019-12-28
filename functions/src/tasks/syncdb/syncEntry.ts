import { QuickBooks } from "../../libs/qbmain";
import { Bill } from "../../models/Qbo/Bill";
import * as moment from "moment";
import { firestore } from "firebase-admin";
import { Depot } from "../../models/Daudi/depot/Depot";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";

/**
 * 
 * @param qbo QBO Class containing valid auth tokens
 * @param fuelConfig COnfig having valid ID's
 * @param since 
 */
export function syncEntry(qbo: QuickBooks, omcId: string, fuelConfig: { [key in FuelType]: FuelConfig }) {
    return qbo.findBills([
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
        //     value: fuelConfig.pms.entryId, operator: "=="
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

                    const convertedEntry = covertBillToEntry(bill, fueltype, LineitemIndex);
                    const batchesdir = firestore()
                        .collection("omc")
                        .doc(omcId)
                        .collection("entry")
                    const fetchedEntry = await batchesdir
                        .where("entry.refs", "array-contains", convertedEntry.entry.refs).get();                    /**
                     * make sure the Entry doenst already exist before writing to db
                     */
                    if (fetchedEntry.empty) {
                        console.log("creating new Entry");
                        return await batchesdir.add(convertedEntry);
                    } else {
                        /**
                         * Check if the same batch number previously existed for addition purposes
                         */
                        const existingEntry = await batchesdir.where("entry.refs", "array-contains", convertedEntry.entry.id).get();

                        if (existingEntry.empty) {
                            console.log("creating new Entry");
                            return await batchesdir.add(convertedEntry);
                        } else {
                            /**
                             * Add the quantity to the existing batch
                             */
                            const newEntry: Entry = existingEntry.docs[0].data() as Entry
                            newEntry.qty.total += convertedEntry.qty.total
                            return await batchesdir.doc(existingEntry.docs[0].id);
                        }
                    }
                } else {
                    return false
                }
            }))
        });
}



function covertBillToEntry(convertedBill: Bill, fueltype: FuelType, LineitemIndex: number): Entry {
    console.log("converting bill to Entry", fueltype, LineitemIndex);

    const entryQty = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty;
    const entryPrice = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.UnitPrice;

    const newEntry: Entry = {
        Amount: convertedBill.Line[LineitemIndex].Amount ? convertedBill.Line[LineitemIndex].Amount : 0,
        entry: {
            id: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
            refs: [{
                QbId: convertedBill.Id,
                qty: entryQty
            }]
        },
        depot: {
            Id: null,
            name: null
        },
        Id: null,
        price: entryPrice,
        qty: {
            directLoad: {
                total: 0
            },
            total: entryQty,
            transfered: {
                total: 0,
                transfers: []
            }
        },
        active: true,
        fuelType: fueltype,
        date: firestore.Timestamp.fromDate(new Date())
    };
    console.log(newEntry)
    return newEntry;
}
