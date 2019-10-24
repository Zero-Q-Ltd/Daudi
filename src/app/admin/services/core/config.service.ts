import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminsService } from "./admins.service";
import { BehaviorSubject } from "rxjs";
import { CompanyConfig, emptycompanydata } from "../../../models/Config";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  companydata: BehaviorSubject<CompanyConfig> = new BehaviorSubject<CompanyConfig>({ ...emptycompanydata });

  constructor(private db: AngularFirestore, private adminservice: AdminsService) {
    adminservice.observableuserdata
      .subscribe(admin => {
        if (admin) {
          this.fetchcompany(admin.qbconfig.sandbox);
        }
      });
  }
  fetchcompany(sandbox: boolean) {
    this.db.firestore.collection("config")
      .doc(sandbox ? "sandbox" : "default")
      .onSnapshot(companydata => {
        if (!companydata.exists) {
          return;
        }
        this.companydata.next(Object.assign({}, { ...emptycompanydata }, { id: companydata.id }, companydata.data()));
      });
  }
  savecompany(data: CompanyConfig) {
    return this.db.firestore.collection("companies")
      .doc("default")
      .set(data);
  }
}
