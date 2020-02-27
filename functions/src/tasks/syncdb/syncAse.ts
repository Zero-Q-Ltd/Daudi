import { firestore } from "firebase-admin";
import { ASE } from "../../models/Daudi/fuel/ASE";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { FuelConfig } from "../../models/Daudi/omc/FuelConfig";
import { newStock, Stock } from "../../models/Daudi/omc/Stock";
import { Bill } from "../../models/Qbo/Bill";
import { kpcStockCollection } from "../crud/daudi/Stock";

/**
 * 
 * @param qbo QBO Class containing valid auth tokens
 * @param fuelConfig COnfig having valid ID's
 * @param since 
 */
export function syncAse(omcId: string, fuelConfig: { [key in FuelType]: FuelConfig }, bills: Bill[]) {
    const ValidLineItems: Array<{
        bill: Bill,
        index: number,
        fueltype: FuelType;
    }> = [];
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
                            });
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ago.aseId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            });
                        } else if (t.ItemBasedExpenseLineDetail.ItemRef.value === fuelConfig.ik.aseId) {
                            ValidLineItems.push({
                                fueltype: FuelType.pms,
                                index,
                                bill
                            });
                        } else {
                            console.log("Bill does not have a valid fueltype attached to it");
                        }
                    }
                } else {
                    console.log("Bill does not have a Line item");
                }
            });
        }
    });

    if (ValidLineItems.length < 1) {
        console.error("ITEM CONFIG NOT FOUND");
        return new Promise(res => res());
    }
    const batch = firestore().batch();
    /**
    * Record the total amount of fuel added in this transaction to update the stock doc
    * By consilidating totals to one var, we allow the possibility of having the same fueltype in the same bill payment multiple times
    */
    const totalAdded: { [key in FuelType]: number } = { ago: 0, ik: 0, pms: 0 };
    return Promise.all(ValidLineItems.map(async item => {
        const convertedASE = covertBillToASE(item.bill, item.fueltype, item.index);
        const directory = firestore()
            .collection("omc")
            .doc(omcId)
            .collection("ases");

        const fetchedbatch = await directory.where("ase.QbId", "==", convertedASE.ase.QbId).get();
        /**
         * make sure the Entry doenst alread exist before writing to db
         */
        if (fetchedbatch.empty) {
            console.log("creating new ASE");
            totalAdded[item.fueltype] += convertedASE.qty;
            return batch.set(directory.doc(), convertedASE);
        } else {
            console.log("ASE exists");
            return Promise.resolve();
        }
    })).then(async () => {
        return await kpcStockCollection(omcId).get().then(snapshot => {
            const stockObject: Stock = { ...newStock(), ...snapshot.data() };
            FuelNamesArray.forEach(fueltype => {
                stockObject.qty[fueltype].ase += totalAdded[fueltype];
            });
            batch.set(kpcStockCollection(omcId), stockObject);
            return batch.commit();
        });
    });
}



function covertBillToASE(convertedBill: Bill, fueltype: FuelType, LineitemIndex: number): ASE {

    const ASEQty = convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty ? convertedBill.Line[LineitemIndex].ItemBasedExpenseLineDetail.Qty : 0;

    const newASE: ASE = {
        Amount: convertedBill.Line[LineitemIndex].Amount ? convertedBill.Line[LineitemIndex].Amount : 0,
        ase: {
            QbId: convertedBill.Id,
            qty: ASEQty
        },
        depot: {
            Id: null,
            name: null
        },
        Id: null,
        price: 0,
        qty: ASEQty,
        active: true,
        fuelType: fueltype,
        date: new Date()
    };
    console.log("converted bill to ASE", fueltype, JSON.stringify(newASE));
    return newASE;
}
