import { QuickBooks } from "../libs/qbmain";
import { QboOrder } from "../models/Qbo/QboOrder";
import { Order } from "../models/Daudi/order/Order";
import { editStats } from "../tasks/crud/daudi/editStats";
import { ReadAndInstantiate } from "../tasks/crud/daudi/QboConfig";
import { readStock, kpcStockCollection } from "../tasks/crud/daudi/Stock";
import { Stock, newStock } from "../models/Daudi/omc/Stock";
import { FuelNamesArray } from "../models/Daudi/fuel/FuelType";
import { firestore } from "firebase-admin";

export function validOrderUpdate(order: Order, omcId: string) {
    switch (order.stage) {
        case 3:
            return editStats(order, "paid");
        case 6:
            /**
             * Delete orders deleted on Daudi, which havae already been created on QB
             */
            if (order.QbConfig.QbId) {
                console.log("deleting order...");
                return ReadAndInstantiate(omcId).then(res => {
                    return res.qbo.getInvoice(order.QbConfig.QbId).then(result => {
                        const resultinvoice = result.Invoice as QboOrder;
                        resultinvoice.void = true;
                        /**
                         * @todo Implement deletion reason and User detail
                         */
                        // resultinvoice.CustomerMemo = {
                        //     value: order.stagedata["6"].data.reason
                        // };
                        return res.qbo.updateInvoice(resultinvoice);
                    });
                });
            } else return true;
            break;
        default:
            return true;
    }
}
export function validTruckUpdate(order: Order, omcId: string) {
    switch (order.truck.stage) {
        /**
         * This is a completed order
         */
        case 4:
            const batch = firestore().batch();

            return editStats(order, "paid");
        default:
            return true;
    }
}

async function adjustASE(omcId: string, order: Order, batch: FirebaseFirestore.WriteBatch) {
    return await readStock(omcId).then(snapshot => {
        const stockObject: Stock = { ...newStock(), ...snapshot.data() };
        FuelNamesArray.forEach(fueltype => {
            /**
             * sum the total qty observed in each entry
             */
            const qtyToAdjust = order.fuel[fueltype].entries.reduce((a, b) => a + (b.qty - b.observed), 0);
            stockObject.qty[fueltype].ase += qtyToAdjust;
        });
        batch.set(kpcStockCollection(omcId), stockObject);
        return batch.commit();
    });
}
async function adjustEntries(omcId: string, order: Order, batch: FirebaseFirestore.WriteBatch) {
    const directory = firestore()
        .collection("omc")
        .doc(omcId)
        .collection("entries");
}