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

  updatedepot(depot: Depot) {
    return this.depotsCollection().doc(depot.Id).update(depot);
  }


  createDepot(depot: Depot) {
    return this.depotsCollection()
      .add(depot);
  }

  depotsCollection() {
    return this.db.firestore.collection("depot");
  }

  depotConfigCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("depotConfig");
  }
}
