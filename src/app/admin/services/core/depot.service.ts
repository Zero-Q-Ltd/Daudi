import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { AdminService } from "./admin.service";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { DepotConfig, emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { ConfigService } from "./config.service";

@Injectable({
  providedIn: "root"
})
export class DepotService {
  alldepots: BehaviorSubject<Array<Depot>> = new BehaviorSubject([]);

  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<{ depot: Depot, config: DepotConfig }> = new BehaviorSubject({ depot: { ...emptydepot }, config: { ...emptyDepotConfig } });


  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private adminservice: AdminService,
    private config: ConfigService) {
    /**
     * Only subscribe to depot when the user data changes
     */
    this.adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        if (admin) {
          this.unsubscribeAll();
          this.fetchdepots();
        }
      });
  }

  updatedepot() {
    return this.db.firestore.collection("depot").doc(this.activedepot.value.depot.Id);
  }


  createDepot(depot: Depot) {
    this.db.firestore.collection("depot")
      .add(depot);
  }

  fetchdepots() {
    const depotquery = this.db.firestore.collection("depot")
      .where("Active", "==", true);
    const subscriprion = depotquery.onSnapshot(snapshot => {
      const tempdepot: Depot = { ...emptydepot, ...snapshot.docs[0].data() };
      tempdepot.Id = snapshot.docs[0].id;
      /**
       * only change the activedepot if the object has just been initialized
       */

      const alldepots = snapshot.docs.map(doc => {
        const value = { ...emptydepot, ...doc.data() };
        value.Id = doc.id;
        return value as Depot;
      });
      if (alldepots.find(depot => depot.Id === this.activedepot.value.depot.Id)) {
        this.changeactivedepot(alldepots.find(depot => depot.Id === this.activedepot.value.depot.Id));
      } else {
        this.changeactivedepot(tempdepot);
      }
      this.alldepots.next(alldepots);
    });
    this.subscriptions.set("alldepots", subscriprion);

  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  /**
   *
   * @param {Depot} depot
   */
  changeactivedepot(depot: Depot) {
    if (JSON.stringify(depot) !== JSON.stringify(this.activedepot.value)) {
      const config = this.config.omcconfig.value.depotconfig[this.config.environment.value].find(t => {
        // console.log(t.depotId);
        // console.log(depot.Id);
        // console.log(t.depotId === depot.Id);
        return t.depotId === depot.Id;
      }) || { ...emptyDepotConfig };
      console.log("changing to:", depot, config);
      this.activedepot.next({ depot, config: { ...emptyDepotConfig, ...config } });
    } else {
      return;
    }


  }
}
