import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminService } from "./admin.service";
import { BehaviorSubject } from "rxjs";
import { Config, emptyConfig } from "src/app/models/omc/Config";
import { Admin } from "src/app/models/admin/Admin";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  omcconfig: BehaviorSubject<Config> = new BehaviorSubject<Config>({ ...emptyConfig });
  sandbox: BehaviorSubject<boolean> = new BehaviorSubject(false);

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
          return;
        }
        this.omcconfig.next(Object.assign({}, { ...emptyConfig }, { id: companydata.id }, companydata.data()));
      });
  }
  saveConfig(omcid: string, data: Config) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("config")
      .doc("main")
      .set(data);
  }
}
