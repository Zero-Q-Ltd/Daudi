import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot } from "../../models/Daudi/depot/Depot";
import { DepotService } from "./core/depot.service";
import { ConfigService } from "./core/config.service";
import { OmcService } from "./core/omc.service";

@Injectable({
  providedIn: "root"
})
export class StatsService {
  activedepot: Depot;

  constructor(
    private config: ConfigService,
    private omc: OmcService,
    private db: AngularFirestore,
    private depotservice: DepotService) {
    depotservice.activedepot.subscribe(depot => {
      // this.activedepot = depot;
    });
  }


  getstats(statsid) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("stats")
      .doc(statsid);
  }

  getstatsrange(start, stop) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("stats")
      .where("date", ">=", start)
      .where("date", "<=", stop);
  }

}
