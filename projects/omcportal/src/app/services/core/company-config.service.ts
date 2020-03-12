import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin } from "app/models/Daudi/admin/Admin";
import { AdminConfig, emptyConfig } from "app/models/Daudi/omc/AdminConfig";
import { OMC } from "app/models/Daudi/omc/OMC";

@Injectable({
  providedIn: "root"
})
export class CompanyConfigService {
  constructor(private db: AngularFirestore) {}

  /**
   * @param omcId
   */

  configDoc(omcId: string) {
    return this.db.firestore
      .collection("omc")
      .doc(omcId)
      .collection("configs")
      .doc(`admin`);
  }

  saveConfig(data: OMC) {
    return this.configDoc(data.Id).set(data);
  }
}
