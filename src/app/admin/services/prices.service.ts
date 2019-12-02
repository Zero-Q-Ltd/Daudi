import { Injectable } from "@angular/core";
import { FuelType, fuelTypeNames, fuelTypeIds } from "../../models/Daudi/fuel/fuelTypes";
import * as moment from "moment";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot } from "../../models/Daudi/depot/Depot";
import { DepotService } from "./core/depot.service";
import { BehaviorSubject } from "rxjs";
import { Price } from "../../models/Daudi/depot/Price";
import { OmcService } from "./core/omc.service";
import { skipWhile } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class PricesService {

  avgprices: {
    [key in keyof typeof FuelType]: {
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
  fueltypesArray = fuelTypeIds;

  constructor(
    private omc: OmcService,
    private db: AngularFirestore,
    private depotservice: DepotService) {
    this.omc.currentOmc
      .pipe(
        skipWhile(t => !t.Id)
      ).subscribe(() => {
        this.subcribePrices();
      });
  }

  subcribePrices() {
    this.depotservice.activedepot.subscribe(depot => {
      // this.activedepot = depot;
      if (depot.depot.Id) {
        this.unsubscribeAll();
        this.fueltypesArray.forEach((fuel) => {
          const fueltyp: FuelType = FuelType[fuel];
          const subscriprion = this.getavgprices(fueltyp)
            .onSnapshot(avgarray => {
              /**
               * calculate the average whenever there is a change in the data
               */
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
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection(`avgprices`)
      .doc(this.db.createId());
  }

  deleteavgprice(id: string) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection(`avgprices`)
      .doc(id);
  }


  getavgprices(fueltye: FuelType) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("avgprices")
      .where("fueltytype", "==", fueltye)
      /**
       * Get only prices changed on the same day
       */
      .where("user.time", ">=", moment().startOf("day").toDate())
      .orderBy("user.time", "desc");
  }

  getAvgpricesrange(start, stop) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection(`avgprices`)
      .where("user.time", ">=", start)
      .where("user.time", "<=", stop);
  }

  createprice() {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection(`prices`)
      .doc(this.db.createId());
  }
}
