import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Depot, emptydepot } from "../../../models/depot/Depot";
import { AdminService } from "./admin.service";
import { BehaviorSubject } from "rxjs";
import { distinctUntilChanged } from "rxjs/operators";
import { Config, emptyConfig } from "../../../models/omc/Config";

@Injectable({
  providedIn: "root"
})
export class DepotService {
  alldepots: BehaviorSubject<Array<Depot>> = new BehaviorSubject([]);

  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<{ depot: Depot, config: Config }> = new BehaviorSubject({ depot: { ...emptydepot }, config: { ...emptyConfig } });


  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(private db: AngularFirestore, private adminservice: AdminService) {
    /**
     * Only subscribe to depot when the user data changes
     */
    adminservice.observableuserdata
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

  fetchdepots() {
    const depotquery = this.db.firestore.collection("depot")
      .where("Active", "==", true);
    const subscriprion = depotquery.onSnapshot(snapshot => {
      const tempdepot: Depot = Object.assign({}, emptydepot, snapshot.docs[0].data());
      tempdepot.Id = snapshot.docs[0].id;
      /**
       * only change the activedepot if the object has just been initialized
       */

      const alldepots = snapshot.docs.map(doc => {
        const value = Object.assign({}, emptydepot, doc.data());
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
      console.log("changing");
      // this.activedepot.next(depot);
    } else {
      return;
    }


  }
}
