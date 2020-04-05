import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin } from "app/models/Daudi/admin/Admin";
import { AdminConfig, emptyConfig } from "app/models/Daudi/omc/AdminConfig";

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
      .collection("configs")
      .doc(`admin`);
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
