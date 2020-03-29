import { QuickBooks } from "../libs/qbmain";
import { Invoice_Estimate } from "../models/Qbo/QboOrder";
import { Order } from "../models/Daudi/order/Order";
import { editStats } from "../tasks/crud/daudi/editStats";
import { ReadAndInstantiate } from "../tasks/crud/daudi/QboConfig";
import {
  readStock,
  kpcStockCollection,
  privateStockCollection
} from "../tasks/crud/daudi/Stock";
import { Stock, newStock } from "../models/Daudi/omc/Stock";
import { FuelNamesArray } from "../models/Daudi/fuel/FuelType";
import { firestore } from "firebase-admin";
import { readDepot } from "../tasks/crud/daudi/depot";
import { toObject } from "../models/utils/SnapshotUtils";
import { emptydepot, Depot } from "../models/Daudi/depot/Depot";
import { emptyEntry } from "../models/Daudi/fuel/Entry";
import { orderCollection } from "../tasks/crud/daudi/Order";

export function validOrderUpdate(order: Order, omcId: string) {
  switch (order.stage) {
    case 3:
      return editStats(omcId, order, "paid");
    case 6:
      /**
       * Delete orders deleted on Daudi, which havae already been created on QB
       */
      if (order.QbConfig.InvoiceId) {
        console.log("deleting order...");
        return ReadAndInstantiate(omcId).then(res => {
          return res.qbo.getInvoice(order.QbConfig.InvoiceId).then(result => {
            const resultinvoice = result.Invoice as Invoice_Estimate;
            resultinvoice.void = true;
            /**
             * @todo Implement deletion reason and User detail
             */
            resultinvoice.CustomerMemo = {
              value: order.orderStageData["6"].user.name
            };
            return Promise.all([
              // editStats(omcId, order, "deleted"),
              res.qbo.updateInvoice(resultinvoice)
            ]);
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
      console.log("Completed order...");

      return readDepot(order.config.depot.id).then(depotData => {
        const depot = toObject(emptydepot, depotData);
        return Promise.all([
          adjustASE(omcId, order, depot, batch),
          adjustEntries(omcId, order, batch)
        ]).then(() => {
          //move the order to complete stage
          console.log(
            "Fuels Stocks Adjustment submissions complete, moving order"
          );

          order.stage = 5;
          order.orderStageData[5] = {
            user: order.printStatus.gatepass.user
          };
          batch.update(orderCollection(omcId).doc(order.Id), order);
          return batch.commit() as Promise<any>;
        });
      });
    default:
      return Promise.resolve("Nothing to do");
  }
}

async function adjustASE(
  omcId: string,
  order: Order,
  depot: Depot,
  batch: FirebaseFirestore.WriteBatch
) {
  return readStock(omcId, depot.Id, depot.config.private).then(snapshot => {
    const stockObject: Stock = { ...newStock(), ...snapshot.data() };
    console.log("Done reading stock", stockObject);

    FuelNamesArray.forEach(fueltype => {
      /**
       * sum the total qty observed in each entry
       */
      const qtyToAdjust = order.fuel[fueltype].entries.reduce(
        (a, b) => a + (b.qty - b.observed),
        0
      );
      console.log("Adjusting stock qty by", qtyToAdjust);
      stockObject.qty[fueltype].ase += qtyToAdjust;
    });
    if (depot.config.private) {
      return batch.update(privateStockCollection(omcId, depot.Id), stockObject);
    } else {
      return batch.update(kpcStockCollection(omcId), stockObject);
    }
  });
}
async function adjustEntries(
  omcId: string,
  order: Order,
  batch: FirebaseFirestore.WriteBatch
) {
  const directory = firestore()
    .collection("omc")
    .doc(omcId)
    .collection("entries");

  //read the entries
  const reads: { qtyToAdjust: number; readPromise: Promise<any> }[] = [];
  FuelNamesArray.forEach(fueltype => {
    /**
     * Creae a read promise for each entry in each fuel type
     * Olny the last entry is relevant in assigning the observed quantities
     */
    if (order.fuel[fueltype].entries.length === 0) {
      console.log(
        "truck has no",
        fueltype,
        "Entry with ",
        order.fuel[fueltype].qty
      );
      return;
    }
    console.log(
      "truck has ",
      fueltype,
      "of",
      order.fuel[fueltype].qty,
      "and ",
      order.fuel[fueltype].entries.length,
      "Entries"
    );

    const lastEntry =
      order.fuel[fueltype].entries[order.fuel[fueltype].entries.length - 1];
    reads.push({
      qtyToAdjust: lastEntry.qty - lastEntry.observed,
      readPromise: directory.doc(lastEntry.id).get()
    });
  });
  return Promise.all(reads.map(t => t.readPromise)).then(results => {
    console.log("Done reading all assiciated entries", reads.length);
    /**
     * @todo needs further testing
     * @dangerous assume that promise resolution order is maintainde and use promise index to resolve original qty
     */
    results.forEach((readResult, index) => {
      const entry = toObject(emptyEntry, readResult);
      /**
       * re-activate the entry just in case
       */
      entry.active = true;
      /**
       * Deduct the difference from the qty used
       */
      entry.qty.used -= reads[index].qtyToAdjust;
      /**
       * Add this qty to the total observed for stats
       */
      entry.qty.directLoad.accumulated += reads[index].qtyToAdjust;
      console.log(
        "Adjusting Entry qty by",
        reads[index].qtyToAdjust,
        "EntryID",
        entry.Id
      );

      batch.update(directory.doc(entry.Id), entry);
    });
    return;
  });
}
