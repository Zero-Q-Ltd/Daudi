import { firestore } from "firebase-admin";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";
import { Bill } from "../../models/Qbo/Bill";
import { readStock, stockCollection } from "../crud/daudi/Stock";
import { EmptyOMCStock, OMCStock } from "../../models/Daudi/omc/Stock";

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
                        if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.pms.entryId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            })
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ago.entryId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            })
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ik.entryId) {
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
        return new Promise(res => res())
    }
    const batch = firestore().batch()
    /**
     * Record the total amount of fuel added in this transaction to update the stock doc
     * By consilidating totals to one var, we allow the possibility of having the same fueltype in the same bill payment multiple times
     */
    const totalAdded: { [key in FuelType]: number } = { ago: 0, ik: 0, pms: 0 }
    return Promise.all(ValidLineItems.map(async item => {
        const convertedEntry = covertBillToEntry(item.bill, item.fueltype, item.index);
        const directory = firestore()
            .collection("omc")
            .doc(omcId)
            .collection("entries")

        /**
         * make sure the Entry doenst already exist before writing to db
         */
        const fetchedEntry = await (await directory.where("entry.name", "==", convertedEntry.entry.name).get())

        if (fetchedEntry.empty) {
            console.log("creating new Entry");
            totalAdded[item.fueltype] += convertedEntry.qty.total
            return batch.set(directory.doc(), convertedEntry)
        } else {
            /**
             * Check if the same entry previously existed for addition purposes
             */
            const existingEntry = await directory.where("entry.refs", "array-contains", convertedEntry.entry.refs[0]).get();

            if (!existingEntry.empty) {
                console.log("Entry exists")
                return Promise.resolve()
            } else {
                /**
                 * Add the quantity to the existing batch
                 */
                console.log("Entry exists, merging values");
                totalAdded[item.fueltype] += convertedEntry.qty.total
                const newEntry: Entry = fetchedEntry.docs[0].data() as Entry
                /**
                 * add the totals
                 */
                newEntry.qty.total += convertedEntry.qty.total
                /**
                 * Add the object to the list of ids
                 */
                newEntry.entry.refs.push(convertedEntry.entry.refs[0])
                return batch.update(directory.doc(fetchedEntry.docs[0].id), newEntry)

            }
        }
    })).then(async () => {
        return await readStock(omcId).then(snapshot => {
            const stockObject: OMCStock = { ...EmptyOMCStock, ...snapshot.data() }
            FuelNamesArray.forEach(fueltype => {
                stockObject.qty[fueltype].entry.totalActive += totalAdded[fueltype]
            })
            batch.set(stockCollection(omcId), stockObject);
            return batch.commit()
        })
    })
    const t = {
        "body": {},
        "contentLength": -1,
        "cookies": {
            "1P_JAR":
                { "domain": ".google.com", "expires": "Mon, 10 Feb 2020 08:00:59 GMT", "httpOnly": false, "maxAge": 0, "path": "/", "secure": true, "value": "2020-01-11-08" }, "NID": { "domain": ".google.com", "expires": "Sun, 12 Jul 2020 08:00:59 GMT", "httpOnly": true, "maxAge": 0, "path": "/", "secure": false, "value": "195=mkrZeToWud1LUOV72tzyyBKXWV6rjtx9Rn9xQVLgEGDfnyRPgWzWIm23bFtZCFeeW96ULIt8pnWOuFf4YYonyVKKqqCyPmfnsI5QRSxT7SR-sY25GJYCCoTp8DDbNZAnY2-txq3bVuQVWZUnJ_a8k3bAoNf91FQcNxvNSLaVkzw" }
        }, "headers": { "Alt-Svc": ["quic=\":443\"; ma=2592000; v=\"46,43\",h3-Q050=\":443\"; ma=2592000,h3-Q049=\":443\"; ma=2592000,h3-Q048=\":443\"; ma=2592000,h3-Q046=\":443\"; ma=2592000,h3-Q043=\":443\"; ma=2592000"], "Cache-Control": ["private, max-age=0"], "Content-Type": ["text/html; charset=ISO-8859-1"], "Date": ["Sat, 11 Jan 2020 08:00:59 GMT"], "Expires": ["-1"], "P3p": ["CP=\"This is not a P3P policy! See g.co/p3phelp for more info.\""], "Server": ["gws"], "Set-Cookie": ["1P_JAR=2020-01-11-08; expires=Mon, 10-Feb-2020 08:00:59 GMT; path=/; domain=.google.com; Secure", "NID=195=mkrZeToWud1LUOV72tzyyBKXWV6rjtx9Rn9xQVLgEGDfnyRPgWzWIm23bFtZCFeeW96ULIt8pnWOuFf4YYonyVKKqqCyPmfnsI5QRSxT7SR-sY25GJYCCoTp8DDbNZAnY2-txq3bVuQVWZUnJ_a8k3bAoNf91FQcNxvNSLaVkzw; expires=Sun, 12-Jul-2020 08:00:59 GMT; path=/; domain=.google.com; HttpOnly"], "X-Frame-Options": ["SAMEORIGIN"], "X-Xss-Protection": ["0"] }, "status": "200 OK", "statusCode": 200
    }
}

function covertBillToEntry(convertedBill: Bill, fueltype: FuelType, LineitemIndex: number): Entry {
    const entryQty = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty;
    const entryPrice = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.UnitPrice | 0;

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
        price: entryPrice,
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
    console.log("converted bill to Entry", fueltype, JSON.stringify(newEntry));
    return newEntry;
}
