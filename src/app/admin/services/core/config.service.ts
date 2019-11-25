import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminService } from "./admin.service";
import { BehaviorSubject } from "rxjs";
import { Config, emptyConfig, QboEnvironment } from "../../../models/omc/Config";
import { Admin } from "../../../models/admin/Admin";
import { Environment } from "../../../models/omc/Environments";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  omcconfig: BehaviorSubject<Config> = new BehaviorSubject<Config>({ ...emptyConfig });
  environment: BehaviorSubject<Environment> = new BehaviorSubject<Environment>("sandbox");

  constructor(private db: AngularFirestore, private adminservice: AdminService) {
    adminservice.observableuserdata
      .subscribe(admin => {
        if (admin) {
          this.fetchcompany(admin);
        }
      });
  }
  fetchcompany(admin: Admin) {
    this.db.firestore.collection("omc")
      .doc(admin.config.omcid)
      .collection("config")
      .doc("main")
      .onSnapshot(companydata => {
        if (!companydata.exists) {
          this.initConfig(admin);
          return;
        }
        this.omcconfig.next(Object.assign({}, { ...emptyConfig }, { id: companydata.id }, companydata.data()));
      });
  }
  /**
   *
   * @param envString
   */
  getEnvironment(envString?: Environment): QboEnvironment {
    if (!envString) {
      return this.omcconfig.value.Qbo[this.environment.value];
    } else {
      return this.omcconfig.value.Qbo[envString];
    }
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
