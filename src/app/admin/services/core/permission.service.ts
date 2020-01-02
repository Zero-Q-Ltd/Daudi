import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AdminService } from "./admin.service";
import { distinctUntilChanged } from "rxjs/operators";
import { BehaviorSubject, ReplaySubject } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class PermissionService {
  pagepermissions = new ReplaySubject(1);
  constructor(private db: AngularFirestore, private adminservice: AdminService) {
    /**
     * Only subscribe to depot when the user data changes
     */
    adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        if (admin) {
          this.fetchpermissions(admin.config.omcId);
        }
      });
  }

  /**
   * fetches the OMC's permissions after the user data has been loaded
   */
  fetchpermissions(omcId: string) {
    this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("permission")
      .doc("page")
      .get()
      .then(permissions => {
        if (permissions.exists) {
          const y = permissions.data();
          y.Id = permissions.id;
          this.pagepermissions.next(y);
        } else {
          console.error("Invalid permission config");
        }
      });
  }

  unsubscribeAll() {
    // this.subscriptions.forEach(value => {
    //   value();
    // });
  }

}
