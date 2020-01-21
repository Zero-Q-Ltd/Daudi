import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import * as moment from "moment";
import {FuelType} from "../../models/Daudi/fuel/FuelType";

@Injectable({
    providedIn: "root"
})
export class PricesService {
    constructor(
        private db: AngularFirestore) {

    }

    createavgprice(omcId: string) {
        return this.avgPricesCollection(omcId)
            .doc();
    }

    avgPricesCollection(omcId: string) {
        return this.db.firestore.collection("omc")
            .doc(omcId)
            .collection(`avgprice`);
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
            .collection(`price`);
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

    createprice(omcId: string) {
        return this.priceCollection(omcId)
            .doc(this.db.createId());
    }
}
