import { Injectable } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { SyncRequest } from "../../../models/Cloud/Sync";
import { MyTimestamp } from "../../../models/firestore/firestoreTypes";
import { CompanySync } from "../../../models/Cloud/CompanySync";
import { CoreService } from "../../services/core/core.service";

@Injectable({
  providedIn: "root"
})
export class CoreAdminService {
  subscriptions: Map<string, () => void> = new Map<string, () => void>();

  constructor(
    private functions: AngularFireFunctions,
    private core: CoreService
  ) {

  }
  syncdb() {
    const req: SyncRequest = {
      time: MyTimestamp.now(),
      synctype: ["BillPayment"]
    };

    const syncobject: CompanySync = {
      config: this.core.config.value,
      omc: this.core.currentOmc.value,
      sync: req
    };

    return this.functions.httpsCallable("requestsync")(syncobject);
  }
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }
}
