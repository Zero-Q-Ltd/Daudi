import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {Depot} from "../../../models/Daudi/depot/Depot";

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
      .collection(`depotConfig`);
  }
  depotConfigDoc(omcId: string, depotId: string) {
    return this.depotConfigCollection(omcId).doc(depotId);
  }
}
