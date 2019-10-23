import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot } from "../../models/Depot";
import { DepotsService } from "./depots.service";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  activedepot: Depot;

  constructor(private db: AngularFirestore, depotservice: DepotsService) {
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
