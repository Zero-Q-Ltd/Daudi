import { SyncRequest } from "../../models/Cloud/Sync";
import { QuickBooks } from "../../libs/qbmain";
import { syncCustomers } from "./syncCustomers";
import { QbTypes } from "../../models/QbTypes";
import { OMCConfig } from '../../models/Daudi/omc/Config';
import { Environment } from '../../models/Daudi/omc/Environments';
import { syncEntry } from "./syncEntry";
import { syncAse } from "./syncAse";
import { findBills } from "./findBills";
import { Bill } from "../../models/Qbo/Bill";

export function processSync(sync: SyncRequest, qbo: QuickBooks, omcId: string, config: OMCConfig, enviromnent: Environment) {
    return Promise.all(
        sync.synctype.map(async (syncdetail: QbTypes) => {
            switch (syncdetail) {
                case "Customer":
                    console.log("Syncing customers");
                    return await syncCustomers(qbo, omcId, enviromnent);
                case "Employee":
                    console.log("Syncing employees");
                    return true;
                // return await syncAdmins(qbo);
                case "Item":
                    console.log("Syncing Items zote");
                    return true;
                // return await syncItems(qbo);
                case "BillPayment":
                    console.log("Syncing Entries and ASEs");
                    // return true;
                    return findBills(qbo).then(async (res) => {
                        return await Promise.all([
                            syncEntry(omcId, enviromnent, config.Qbo[enviromnent].fuelconfig, res.QueryResponse.Bill || []),
                            syncAse(omcId, enviromnent, config.Qbo[enviromnent].fuelconfig, res.QueryResponse.Bill || [])
                        ]);
                    })

                default:
                    console.log("Unrecognized object for syncdetected, breaking");
                    return true;
            }
        })
    );
}