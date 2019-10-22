import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {Depot_, emptydepot} from "../../models/Depot";
import {AdminsService} from "./admins.service";
import {BehaviorSubject} from "rxjs";
import {distinctUntilChanged} from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class DepotsService {
  alldepots: BehaviorSubject<Array<Depot_>> = new BehaviorSubject([]);

  /**
   * Be careful when subscribing to this value because it will always emit a value
   */
  activedepot: BehaviorSubject<Depot_> = new BehaviorSubject<Depot_>(emptydepot);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(private db: AngularFirestore, private adminservice: AdminsService) {
    /**
     * Only subscribe to depots when the user data changes
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
    return this.db.firestore.collection("depots").doc(this.activedepot.value.Id);
  }

  fetchdepots() {
    let depotquery = this.db.firestore.collection("depots")
      .where("Active", "==", true)
      .orderBy("sandbox", "desc");

    if (!this.adminservice.userdata.config.viewsandbox) {
      depotquery = depotquery.where("sandbox", "==", this.adminservice.userdata.config.viewsandbox);
    }
    let subscriprion = depotquery.onSnapshot(snapshot => {
      let tempdepot: Depot_ = Object.assign({}, emptydepot, snapshot.docs[0].data());
      tempdepot.Id = snapshot.docs[0].id;
      /**
       * only change the activedepot if the object has just been initialized
       */

      let alldepots = snapshot.docs.map(doc => {
        let value = Object.assign({}, emptydepot, doc.data());
        value.Id = doc.id;
        return value as Depot_;
      });
      if (alldepots.find(depot => depot.Id === this.activedepot.value.Id)) {
        this.changeactivedepot(alldepots.find(depot => depot.Id === this.activedepot.value.Id));
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
   * @param {Depot_} depot
   */
  changeactivedepot(depot: Depot_) {
    if (JSON.stringify(depot) !== JSON.stringify(this.activedepot.value)) {
      console.log("changing");
      this.activedepot.next(depot);
    } else {
      return;
    }


  }
}
