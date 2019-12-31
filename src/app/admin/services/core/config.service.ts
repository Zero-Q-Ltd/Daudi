import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminService } from "./admin.service";
import { BehaviorSubject, Observable } from "rxjs";
import { Config, emptyConfig, QboEnvironment } from "../../../models/Daudi/omc/Config";
import { Admin } from "../../../models/Daudi/admin/Admin";
import { Environment } from "../../../models/Daudi/omc/Environments";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class ConfigService {

  constructor(private db: AngularFirestore, private adminservice: AdminService) {

  }


  fetchConfig(admin: Admin): Observable<Config> {
    return this.db.collection("omc")
      .doc(admin.config.omcid)
      .collection("config")
      .doc<Admin>("main")
      .snapshotChanges()
      .pipe(
        map(companydata => {
          return { ...emptyConfig, ...{ id: companydata.payload.id }, ...companydata.payload.data() };
        }));
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
