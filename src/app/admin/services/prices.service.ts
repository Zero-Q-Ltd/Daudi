import { Injectable } from "@angular/core";
import { fuelTypes } from "../../models/Daudi/fuel/fuelTypes";
import * as moment from "moment";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot } from "../../models/Daudi/depot/Depot";
import { DepotService } from "./core/depot.service";
import { BehaviorSubject } from "rxjs";
import { Price } from "../../models/Daudi/depot/Price";

@Injectable({
  providedIn: "root"
})
export class PricesService {
  activedepot: Depot;

  avgprices: {
    [key in fuelTypes]: {
      total: BehaviorSubject<number>,
      avg: BehaviorSubject<number>,
      prices: BehaviorSubject<Array<Price>>
    }
  } = {
      pms: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      },
      ago: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      },
      ik: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      }
    };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  fueltypesArray = Object.keys(fuelTypes);

  constructor(private db: AngularFirestore, private depotservice: DepotService) {
    depotservice.activedepot.subscribe(depot => {
      // this.activedepot = depot;
      if (depot.depot.Id) {
        this.unsubscribeAll();
        this.fueltypesArray.forEach(fueltyp => {
          const subscriprion = this.getavgprices(fueltyp as any)
            .onSnapshot(avgarray => {
              /**
               * calculate the average whenever there is a change in the data
               */
              // console.log(avgarray.docs[0].data());
              // console.log(this.avgprices[fueltyp].total.value);
              this.avgprices[fueltyp].total.next(0);
              this.avgprices[fueltyp].prices.next(avgarray.docs.map(doc => {
                const value = doc.data() as Price;
                value.Id = doc.id;
                const newtotal = this.avgprices[fueltyp].total.value + Number(value.price);
                this.avgprices[fueltyp].total.next(newtotal);
                return value;
              }));
            });
          this.subscriptions.set(`${fueltyp}prices`, subscriprion);
        });
      }
    });
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  createavgprice() {
    return this.db.firestore.collection("depots").doc(this.activedepot.Id).collection(`avgprices`).doc(this.db.createId());
  }

  deleteavgprice(id: string) {
    return this.db.firestore.collection("depots").doc(this.activedepot.Id).collection(`avgprices`).doc(id);
  }


  getavgprices(fueltye: fuelTypes) {
    if (!this.activedepot.Id) {
      return;
    }
    return this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("avgprices")
      .where("fueltytype", "==", fueltye)
      /**
       * Get only prices changed on the same day
       */
      .where("user.time", ">=", moment().startOf("day").toDate())
      .orderBy("user.time", "desc");
  }

  getAvgpricesrange(start, stop) {
    return this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection(`avgprices`)
      .where("user.time", ">=", start)
      .where("user.time", "<=", stop);
  }

  createprice() {
    return this.db.firestore.collection("depots").doc(this.activedepot.Id).collection(`prices`).doc(this.db.createId());
  }
}
