import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot } from "../../models/depot/Depot";
import { DepotService } from "./core/depot.service";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  activedepot: Depot;

  constructor(private db: AngularFirestore, depotservice: DepotService) {
    depotservice.activedepot.subscribe(depot => {
      this.activedepot = depot;
    });
  }


  getstats(statsid) {
    return this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("stats")
      .doc(statsid);
  }

  getstatsrange(start, stop) {
    return this.db.firestore.collection("depots")
      .doc(this.activedepot.Id)
      .collection("stats")
      .where("date", ">=", start)
      .where("date", "<=", stop);
  }

}
