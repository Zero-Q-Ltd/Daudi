import { Injectable } from "@angular/core";
import { Entry, emptybatches } from "../../models/Daudi/fuel/Entry";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { fuelTypes } from "../../models/Daudi/fuel/fuelTypes";
import { Depot } from "../../models/Daudi/depot/Depot";

@Injectable({
  providedIn: "root"
})
export class BatchesService {
  fetchingbatches = new BehaviorSubject(true);
  activedepot: Depot;
  depotbatches: {
    pms: BehaviorSubject<Array<Entry>>,
    ago: BehaviorSubject<Array<Entry>>,
    ik: BehaviorSubject<Array<Entry>>,
  } = {
      pms: new BehaviorSubject([]),
      ago: new BehaviorSubject([]),
      ik: new BehaviorSubject([])
    };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  fueltypesArray = Object.keys(fuelTypes);

  constructor(private db: AngularFirestore, private depotsservice: DepotService) {
    this.depotsservice.activedepot.subscribe(depot => {
      // this.activedepot = depot;
      this.unsubscribeAll();
      this.fetchbatches();
    });
  }

  fetchbatches() {
    this.fetchingbatches.next(true);
    this.fueltypesArray.forEach((fueltype) => {
      if (!this.depotsservice.activedepot.value.depot.Id) {
        return;
      }
      const subscriprion = this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.depot.Id).collection("batches")
        .orderBy("date", "asc")
        .where("status", "==", 1)
        .where("type", "==", fueltype)
        .onSnapshot(snapshot => {
          this.fetchingbatches.next(false);
          // if(!snapshot.empty) console.log(snapshot.docs[0].data())
          this.depotbatches[fueltype].next(snapshot.docs.map(doc => {
            const value = Object.assign({}, emptybatches, doc.data());
            value.Id = doc.id;
            return value as Entry;
          }));
        });
      this.subscriptions.set(`${fueltype}batch`, subscriprion);
    });
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  getbatches(type: fuelTypes) {

    return this.db.firestore.collection("depots")
      .doc(this.depotsservice.activedepot.value.depot.Id)
      .collection("batches")
      .where("type", "==", type)
      .orderBy("status", "desc");
  }

  updatebatch(batchid: string) {
    return this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.depot.Id).collection(`batches`).doc(batchid);
  }
}
