import { Injectable } from "@angular/core";
import * as moment from "moment";
import { emptytruck, Truck, truckqueryStagesarray, truckStages } from "../../models/Truck";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotsService } from "./depots.service";
import { Depot } from "../../models/Depot";

@Injectable({
  providedIn: "root"
})
export class TrucksService {
  loadingtrucks = new BehaviorSubject(true);

  trucks: {
    [key in truckStages]: BehaviorSubject<Array<Truck>>
  } = {
      0: new BehaviorSubject<Array<Truck>>([]),
      1: new BehaviorSubject<Array<Truck>>([]),
      2: new BehaviorSubject<Array<Truck>>([]),
      3: new BehaviorSubject<Array<Truck>>([]),
      4: new BehaviorSubject<Array<Truck>>([])
    };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(private db: AngularFirestore, private depotsservice: DepotsService) {
    this.depotsservice.activedepot.subscribe(depot => {
      this.unsubscribeAll();
      this.getpipeline(depot);
    });
  }

  /**
   * Fetches a truck from the db
   * @param truckid
   */
  getTruck(truckid: string) {
    return this.db.firestore.collection("depots")
      .doc(this.depotsservice.activedepot.value.Id)
      .collection("trucks")
      .doc(truckid);
  }

  createTruck(truckid: string) {
    return this.db.firestore.collection("depots")
      .doc(this.depotsservice.activedepot.value.Id)
      .collection("trucks")
      .doc(truckid);
  }

  /**
   * Fetches all orders and trucks Relevant to the header
   *
   */
  getpipeline(depot: Depot) {
    if (!depot.Id) {
      return;
    }
    /**
     * reset the trucks and orders array when this function is invoked
     */
    this.trucks["0"].next([]);
    this.trucks["1"].next([]);
    this.trucks["2"].next([]);
    this.trucks["3"].next([]);
    this.trucks["4"].next([]);

    // fetch trucks
    truckqueryStagesarray.forEach(stage => {
      const subscription = this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.Id).collection("trucks")
        .where("stage", "==", Number(stage))
        .orderBy("stagedata.1.user.time", "desc")
        .onSnapshot(snapshot => {

          /**
           * reset the array at the postion when data changes
           */
          this.trucks[stage].next([]);

          // console.log(docSnapshot)
          /**
           * dont assign a value in case the query delayed and the depot changed before it returned a value
           */
          if (snapshot.empty || snapshot.docs[0].data().config.depot.Id !== this.depotsservice.activedepot.value.Id) {
            if (snapshot.empty) {
              this.loadingtrucks.next(false);
            }
            return;
          }
          this.trucks[stage].next(snapshot.docs.map(doc => {
            const value = doc.data();
            value.Id = doc.id;
            return value as Truck;
          }));
        }, err => {
          console.log(`Encountered error: ${err}`);
        });
      this.subscriptions.set(`trucks${stage}`, subscription);

    });
    const startofweek = moment().startOf("week").toDate();

    /**
     * Fetch completed trucks
     */
    const stage4subscription = this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.Id).collection("trucks")
      .where("stage", "==", 4)
      .where("stagedata.4.user.time", ">=", startofweek)
      .orderBy("stagedata.4.user.time", "desc")
      .onSnapshot(snapshot => {
        // console.log(docSnapshot)
        /**
         * dont assign a value in case the query delayed and the depot changed before it returned a value
         */
        if (snapshot.empty || snapshot.docs[0].data().config.depot.Id !== this.depotsservice.activedepot.value.Id) {
          if (snapshot.empty) {
            this.loadingtrucks.next(false);
          }
          return;
        }
        this.trucks[4].next(snapshot.docs.map(doc => {
          const value = Object.assign({}, emptytruck, doc.data());
          value.Id = doc.id;
          return value as Truck;
        }));
      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    this.subscriptions.set(`trucks4`, stage4subscription);

  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  updatetruck(truckid: string) {
    return this.db.firestore.collection("depots").doc(this.depotsservice.activedepot.value.Id).collection(`trucks`).doc(truckid);
  }
}
