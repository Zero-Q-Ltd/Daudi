import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { CoreService } from "./core.service";

@Injectable({
  providedIn: "root"
})
export class DepotService {


  constructor(
    private db: AngularFirestore) {

  }

  updatedepot() {
    // return this.db.firestore.collection("depot").doc(this.core.activedepot.value.depot.Id);
  }


  createDepot(depot: Depot) {
    this.db.firestore.collection("depot")
      .add(depot);
  }

  fetchDepots(queryFn: QueryFn): Observable<Depot[]> {
    return this.db.collection<Depot[]>("depot", queryFn)
      .snapshotChanges()
      .pipe(map(t => {
        return t.map(depot => {
          return {
            ...emptydepot, ...{ Id: depot.payload.doc.id }, ...depot.payload.doc.data()
          };
        });
      }
      ));
  }
}
