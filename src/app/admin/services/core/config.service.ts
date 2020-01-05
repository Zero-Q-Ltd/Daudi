import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin } from "../../../models/Daudi/admin/Admin";
import { emptyConfig, OMCConfig } from "../../../models/Daudi/omc/Config";
import { AdminService } from "./admin.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {

  constructor(private db: AngularFirestore, private adminservice: AdminService) {

  }

  /**
   * @param omcId
   */

  configDoc(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("values")
      .doc("config");
  }
  stockDoc(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("values")
      .doc("stock");
  }


  initConfig(admin: Admin) {
    const newConfig: OMCConfig = { ...emptyConfig };
    this.saveConfig(admin.config.omcId, newConfig);
  }

  saveConfig(omcId: string, data: OMCConfig) {
    return this.configDoc(omcId)
      .set(data);
  }
}
