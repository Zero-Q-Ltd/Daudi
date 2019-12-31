import { Injectable } from "@angular/core";
import { AngularFirestore, FieldPath, QueryFn } from "@angular/fire/firestore";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { AdminService } from "./admin.service";
import { ConfigService } from "./config.service";
import { CoreService } from "./core.service";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import { WhereFilterOp, FieldPath, OrderByDirection } from "@google-cloud/firestore";
import { query } from "@angular/animations";

@Injectable({
  providedIn: "root"
})
export class DepotService {


  constructor(
    private core: CoreService,
    private db: AngularFirestore,
    private adminservice: AdminService,
    private config: ConfigService) {

  }

  updatedepot() {
    return this.db.firestore.collection("depot").doc(this.core.activedepot.value.depot.Id);
  }


  createDepot(depot: Depot) {
    this.db.firestore.collection("depot")
      .add(depot);
  }

  fetchDepots(queryFn: QueryFn): Observable<Depot[]> {
    return this.db.collection<Depot>("depot", queryFn)
      .snapshotChanges()
      .pipe(map(t => {
        return {
          ...t.map(depot => {
            return {
              ...emptydepot, ...{ Id: depot.payload.doc.id }, ...depot.payload.doc.data()
            };
          })
        };
      }
      ));
  }
}
