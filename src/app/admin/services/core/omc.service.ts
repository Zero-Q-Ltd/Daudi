import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { emptyomc, OMC } from "../../../models/Daudi/omc/OMC";

@Injectable({
  providedIn: "root"
})
export class OmcService {

  constructor(
    private db: AngularFirestore, ) {
  }


  omcCollection() {
    return this.db.firestore.collection("omc");
  }

  omcStockCollection(imcId: string) {
    return this.db.firestore.collection("omc")
      .doc("values")
      .collection("stock");
  }
}
