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
        FuelNamesArray.map(fuel => {
            return {
                field: "Line.ItemBasedExpenseLineDetail.ItemRef.value",
                value: fuelConfig[fuel].entryId, operator: "=="
            }
        }),
        { desc: "MetaData.LastUpdatedTime" },
        /**
         * Use the update time to compare with sync request time
         */
        {
            field: "TxnDate",
            value: moment()
                .subtract(1, "day")
                .startOf("day")
                .format("YYYY-MM-DD"),
            operator: ">="
        }
    ])
        .then(billpayments => {
            const allbillpayment = (billpayments.QueryResponse.Bill as Array<Bill>) || [];

            return Promise.all(
                allbillpayment.map(async payment => {
                    const convertedbacth = covertbilltobatch(payment);

                    const batchesdir = firestore()
                        .collection("omc")
                        .doc(omcId)
                        .collection("entry")
                    const fetchedEntry = await batchesdir
                        .where("QbId", "==", payment.Id).get();
                    /**
                     * make sure the Entry doenst alread exist before writing to db
                     */
                    if (fetchedEntry.empty) {
                        console.log("creating new batch");
                        return await batchesdir.add(convertedbacth);
                    } else {
                        /**
                         * Check if the same batch number previously existed for addition purposes
                         */
                        const existingEntry = await batchesdir
                            .where("entry", "==", convertedbacth.entry).get();
                        if (existingEntry.empty){
                                console.log("creating new batch");
                                return await batchesdir.add(convertedbacth);
                            }else{
                                /**
                                 * Add the quantity to the existing batch
                                 */
                                const newEntry: Entry = existingEntry.docs[0].data() as Entry
                                newEntry.qty.total += convertedbacth.qty.total
                                return await batchesdir.doc(existingEntry.docs[0].id);
                            }
                    }
                })
            );

        });
}



function covertbilltobatch(convertedBill: Bill): Entry | null {
    console.log("converting bill to batch");

    const entryQty = convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty ? convertedBill.Line[0].ItemBasedExpenseLineDetail.Qty : 0;
    const entryPrice = convertedBill.Line[0].ItemBasedExpenseLineDetail.UnitPrice ? convertedBill.Line[0].ItemBasedExpenseLineDetail.UnitPrice : 0
    const fueltype = FuelType[convertedBill.Line[0].ItemBasedExpenseLineDetail.ItemRef.name.toLowerCase()];


    const newEntry: Entry = {
        Amount: convertedBill.Line[0].Amount ? convertedBill.Line[0].Amount : 0,
        entry: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
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
        QbId: convertedBill.Id,
        active: true,
        fuelType: fueltype,
        date: firestore.Timestamp.fromDate(new Date())
    };
    return newEntry;
}
