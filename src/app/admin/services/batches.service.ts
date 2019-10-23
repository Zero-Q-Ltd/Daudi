import { Injectable } from "@angular/core";
import { fueltypesArray } from "../../models/Fueltypes";
import { Batch, emptybatches } from "../../models/Batch";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotsService } from "./depots.service";
import { fuelTypes } from "../../models/universal";
import { Depot } from "../../models/Depot";

@Injectable({
  providedIn: "root"
})
export class BatchesService {
  fetchingbatches = new BehaviorSubject(true);
  activedepot: Depot;
  depotbatches: {
    pms: BehaviorSubject<Array<Batch>>,
    ago: BehaviorSubject<Array<Batch>>,
    ik: BehaviorSubject<Array<Batch>>,
  } = {
      pms: new BehaviorSubject([]),
      ago: new BehaviorSubject([]),
      ik: new BehaviorSubject([])
    };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(private db: AngularFirestore, private depotsservice: DepotsService) {
    this.depotsservice.activedepot.subscribe(depot => {
      this.activedepot = depot;
      this.unsubscribeAll();
      this.fetchbatches();
    });
  }

  fetchbatches() {
    this.fetchingbatches.next(true);
    fueltypesArray.forEach((fueltype) => {
      if (!this.depotsservice.activedepot.value.Id) {
        return;
      }
      const subscriprion = this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.Id).collection("batches")
        .orderBy("date", "asc")
        .where("status", "==", 1)
        .where("type", "==", fueltype)
        .onSnapshot(snapshot => {
          this.fetchingbatches.next(false);
          // if(!snapshot.empty) console.log(snapshot.docs[0].data())
          this.depotbatches[fueltype].next(snapshot.docs.map(doc => {
            const value = Object.assign({}, emptybatches, doc.data());
            value.Id = doc.id;
            return value as Batch;
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
      .doc(this.depotsservice.activedepot.value.Id)
      .collection("batches")
      .where("type", "==", type)
      .orderBy("status", "desc");
  }

  updatebatch(batchid: string) {
    return this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.Id).collection(`batches`).doc(batchid);
  }
}
