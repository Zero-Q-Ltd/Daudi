import { firestore } from "firebase-admin";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelType } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";
import { Bill } from "../../models/Qbo/Bill";

/**
 * 
 * @param qbo QBO Class containing valid auth tokens
 * @param fuelConfig COnfig having valid ID's
 * @param since 
 */
export function syncEntry(omcId: string, fuelConfig: { [key in FuelType]: FuelConfig }, bills: Bill[]) {
    const ValidLineItems: Array<{
        bill: Bill,
        index: number,
        fueltype: FuelType
    }> = []
    bills.map(async bill => {
        if (bill.Line) {
            bill.Line.forEach((t, index) => {
                if (t.ItemBasedExpenseLineDetail) {
                    {
                        if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.pms.aseId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            })
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ago.aseId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            })
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ik.aseId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            })
                        } else {
                            console.log("Bill does not have a valid fueltype attached to it")
                        }
                    }
                } else {
                    console.log("Bill does not have a Line item")
                }
            })
        }
    })

    if (ValidLineItems.length < 1) {
        console.error("ITEM CONFIG NOT FOUND")
        return new Promise(res => res)
    }
    const batch = firestore().batch()
    return Promise.all(ValidLineItems.map(async item => {
        const convertedEntry = covertBillToEntry(item.bill, item.fueltype, item.index);
        const directory = firestore()
            .collection("omc")
            .doc(omcId)
            .collection("entry")

        /**
         * make sure the Entry doenst already exist before writing to db
         */
        const fetchedEntry = await directory
            .where("entry.refs", "array-contains", convertedEntry.entry.refs[0]).get();
        if (fetchedEntry.empty) {
            console.log("creating new Entry");
            return batch.set(directory.doc(), convertedEntry)
        } else {
            /**
             * Check if the same entry previously existed for addition purposes
             */
            const existingEntry = await directory.where("entry.name", "array-contains", convertedEntry.entry.name).get();

            if (existingEntry.empty) {
                console.log("creating new Entry")
                return batch.set(directory.doc(), convertedEntry)
            } else {
                /**
                 * Add the quantity to the existing batch
                 */
                console.log("Entry exists, merging values");

                const newEntry: Entry = existingEntry.docs[0].data() as Entry
                newEntry.qty.total += convertedEntry.qty.total
                return batch.update(directory.doc(existingEntry.docs[0].id), newEntry)
            }
        }
    })).then(() => {
        return batch.commit()
    })
}



function covertBillToEntry(convertedBill: Bill, fueltype: FuelType, LineitemIndex: number): Entry {
    const entryQty = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty;
    const entryPrice = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.UnitPrice;

    const newEntry: Entry = {
        Amount: convertedBill.Line[LineitemIndex].Amount ? convertedBill.Line[LineitemIndex].Amount : 0,
        entry: {
            name: convertedBill.DocNumber ? convertedBill.DocNumber : "Null",
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
        price: entryPrice | 0,
        qty: {
            directLoad: {
                total: 0,
                accumulated: {
                    total: 0,
                    usable: 0
                }
            },
            total: entryQty,
            transferred: {
                total: 0,
                transfers: []
            },
            used: 0
        },
        active: true,
        fuelType: fueltype,
        date: firestore.Timestamp.fromDate(new Date())
    };
    console.log("converted bill to ASE", convertedBill.Line[LineitemIndex], fueltype, LineitemIndex, newEntry);
    return newEntry;
}
