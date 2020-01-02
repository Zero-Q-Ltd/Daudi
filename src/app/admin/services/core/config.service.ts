import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Admin } from "../../../models/Daudi/admin/Admin";
import { Config, emptyConfig } from "../../../models/Daudi/omc/Config";
import { AdminService } from "./admin.service";

@Injectable({
  providedIn: "root"
})
export class ConfigService {

  constructor(private db: AngularFirestore, private adminservice: AdminService) {

  }


  configCollection(admin: Admin) {
    return this.db.firestore.collection("omc")
      .doc(admin.config.omcid)
      .collection("config")
      .doc("main");
  }


  initConfig(admin: Admin) {
    const newConfig: Config = { ...emptyConfig };
    this.saveConfig(admin.config.omcid, newConfig);
  }

  saveConfig(omcid: string, data: Config) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("config")
      .doc("main")
      .set(data);
  }
}
