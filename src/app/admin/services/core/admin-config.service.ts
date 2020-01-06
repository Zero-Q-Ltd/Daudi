import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin } from "../../../models/Daudi/admin/Admin";
import { emptyConfig, AdminConfig } from "../../../models/Daudi/omc/Config";

@Injectable({
  providedIn: "root"
})
export class AdminConfigService {

  constructor(private db: AngularFirestore) {

  }
  /**
   * @param omcId
   */

  configDoc(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("values")
      .doc(`config`);
  }
  stockDoc(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("values")
      .doc("stock");
  }


  initConfig(admin: Admin) {
    const newConfig: AdminConfig = { ...emptyConfig };
    this.saveConfig(admin.config.omcId, newConfig);
  }

  saveConfig(omcId: string, data: AdminConfig) {
    return this.configDoc(omcId)
      .set(data);
  }
}
