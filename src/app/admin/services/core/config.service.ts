import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminsService } from "./admins.service";
import { BehaviorSubject } from "rxjs";
import { emptyomc } from "src/app/models/omc/Config";
import { OMC } from "src/app/models/omc/OMC";
import { Admin } from "src/app/models/admin/Admin";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  companydata: BehaviorSubject<OMC> = new BehaviorSubject<OMC>({ ...emptyomc });

  constructor(private db: AngularFirestore, private adminservice: AdminsService) {
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
      .onSnapshot(companydata => {
        if (!companydata.exists) {
          return;
        }
        this.companydata.next(Object.assign({}, { ...emptyomc }, { id: companydata.id }, companydata.data()));
      });
  }
  savecompany(data: OMC) {
    return this.db.firestore.collection("companies")
      .doc("default")
      .set(data);
  }
}
