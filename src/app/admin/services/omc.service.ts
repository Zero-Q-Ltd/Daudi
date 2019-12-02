import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { DepotService } from "./core/depot.service";
import { take } from "rxjs/operators";
import { OMC, emptyomc } from "../../models/Daudi/omc/OMC";
import { AdminService } from "./core/admin.service";

@Injectable({
  providedIn: "root"
})
export class OmcService {

  omcs: BehaviorSubject<Array<OMC>> = new BehaviorSubject<Array<OMC>>([]);
  currentOmc: BehaviorSubject<OMC> = new BehaviorSubject<OMC>(emptyomc);
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    private db: AngularFirestore,
    private depotsservice: DepotService,
    private admin: AdminService) {
    /**
     * only get OMC's when a valid depot has been assigned
     * only take the first element, OMC's are not dependent on depot
     */
    this.depotsservice.activedepot.pipe(take(1)).subscribe(value => {
      this.unsubscribeAll();
      this.getomcs();
    });

  }

  // import * as omcs from '../../../assets/omc.json';
  // createallomc() {
  //   console.log('called');
  //   omcs['Sheet1'].forEach(async (omc: Omc) => {
  //     omc.name = omc.name.toLowerCase();
  //     console.log(omc);
  //     return await this.db.firestore.collection('omc').doc(this.db.createId()).set(omc);
  //
  //   });
  //
  // }
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  getomcs() {
    const subscriprion = this.db.firestore.collection("omc")
      .orderBy("name", "asc")
      .onSnapshot(snapshot => {
        this.omcs.next(snapshot.docs.map(value => {
          const co: OMC = value.data() as OMC;
          co.Id = value.id;
          /**
           * use this opportunity to find the current omc
           * We are sure depots are fetched after the current user hasa been fetched
           */
          if (co.Id === this.admin.userdata.config.omcid) {
            this.currentOmc.next(co);
          }
          return co;
        }));
      });
    this.subscriptions.set("allomcs", subscriprion);
  }
}
