import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {Depot} from "../../models/Daudi/depot/Depot";
import {DepotService} from "./core/depot.service";
import {AdminConfigService} from "./core/admin-config.service";
import {OmcService} from "./core/omc.service";

@Injectable({
    providedIn: "root"
})
export class StatsService {
    activedepot: Depot;

    constructor(
        private config: AdminConfigService,
        private omc: OmcService,
        private db: AngularFirestore,
        private core: DepotService) {

    }


    getstats(statsid: string, omcId: string) {
        return this.db.firestore.collection("omc")
            .doc(omcId)
            .collection("stats")
            .doc(statsid);
    }

    getstatsrange(omcId: string, start, stop) {
        return this.db.firestore.collection("omc")
            .doc(omcId)
            .collection("stats")
            .where("date", ">=", start)
            .where("date", "<=", stop);
    }

}
