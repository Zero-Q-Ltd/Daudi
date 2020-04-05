import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FuelType } from "app/models/Daudi/fuel/FuelType";
import * as moment from "moment";

@Injectable({
  providedIn: "root"
})
export class PricesService {
  constructor(
    private db: AngularFirestore) {

  }

  avgPricesCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection(`avgPrices`);
  }

  deleteavgprice(omcId: string, avgId: string) {
    return this.avgPricesCollection(omcId)
      .doc(avgId);
  }

  getTodayAvgPrices(omcId: string, depotId: string, fueltye: FuelType) {
    return this.getAvgpricesrange(omcId, depotId, fueltye, moment().startOf("day").toDate())
      .orderBy("user.time", "desc");
  }

  priceCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection(`prices`);
  }
  minPriceCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection(`minPrices`);
  }
  TaxCollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection(`taxExcemptPrices`);
  }

  getAvgpricesrange(omcId: string, depotId: string, fueltye: FuelType, start, stop?) {
    let query = this.avgPricesCollection(omcId)
      .where("fueltytype", "==", fueltye)
      .where("user.time", ">=", start)
      .where("depotId", "==", depotId);
    if (stop) {
      query = query.where("user.time", "<=", stop);
    }
    return query;
  }

}
