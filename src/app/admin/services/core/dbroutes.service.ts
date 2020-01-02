import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable({
  providedIn: "root"
})
export class DBRoutesService {
  db: AngularFirestore;
  constructor(
    public database: AngularFirestore,
  ) {
    this.db = database;
  }
  public static orderCollection(omcid: string) {
    return db.firestore.collection("omc")
      .doc(omcid)
      .collection("order");
  }

}
