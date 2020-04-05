import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class StocksService {

  constructor(private db: AngularFirestore) {

  }
  /**
   * Returns the stock doc, depending on whether it's a private depot
   * @param omcId
   * @param depotId
   * @param Private
   */
  stockDoc(omcId: string, depotId: string, privateDepot: boolean) {
    if (privateDepot) {
      return this.db.firestore.collection("omc")
        .doc(omcId)
        .collection("stock")
        .doc(depotId);
    } else {
      return this.db.firestore.collection("omc")
        .doc(omcId)
        .collection("stock")
        .doc("kpc");
    }

  }
}
