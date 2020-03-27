import { QuickBooks } from "../../libs/qbmain";
import { SyncRequest } from "../../models/Cloud/Sync";
import { QbTypes } from "../../models/QbTypes";
import { findBills } from "./findBills";
import { syncAse } from "./syncAse";
import { syncCustomers } from "./syncCustomers";
import { syncEntry } from "./syncEntry";
import { QboCofig } from "../../models/Cloud/QboEnvironment";
import { syncAdmins } from "./syncAdmins";

export function processSync(
  sync: SyncRequest,
  qbo: QuickBooks,
  omcId: string,
  config: QboCofig
): Promise<any> {
  return Promise.all(
    sync.synctype.map(async (syncdetail: QbTypes) => {
      switch (syncdetail) {
        case "Customer":
          console.log("Syncing customers");
          return await syncCustomers(qbo, omcId);
        case "Employee":
          console.log("Syncing employees");
          return syncAdmins(qbo, omcId);
        // return await syncAdmins(qbo);
        case "Item":
          console.log("Syncing Items zote");
          return true;
        // return await syncItems(qbo);
        case "BillPayment":
          console.log("Syncing Entries and ASEs");
          // return true;
          return findBills(qbo).then(async res => {
            return await Promise.all([
              syncEntry(omcId, config.fuelconfig, res.QueryResponse.Bill || []),
              syncAse(omcId, config.fuelconfig, res.QueryResponse.Bill || [])
            ]);
          });

        default:
          console.log("Unrecognized object for syncdetected, breaking");
          return true;
      }
    })
  );
}
