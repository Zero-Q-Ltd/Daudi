import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { OmcService } from "./core/omc.service";
import { skipWhile } from "rxjs/operators";
import { ASE, emptyASEs } from "../../models/Daudi/fuel/ASE";

@Injectable({
  providedIn: "root"
})
export class AseService {
  fetchingASEs = new BehaviorSubject(true);
  depotASEs: {
    pms: BehaviorSubject<Array<ASE>>,
    ago: BehaviorSubject<Array<ASE>>,
    ik: BehaviorSubject<Array<ASE>>,
  } = {
      pms: new BehaviorSubject([]),
      ago: new BehaviorSubject([]),
      ik: new BehaviorSubject([])
    };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  fueltypesArray = FuelNamesArray;

  constructor(
    private db: AngularFirestore,
    private omc: OmcService,
    private depotsservice: DepotService) {
    this.omc.currentOmc.pipe(
      skipWhile(t => !t.Id)
    ).subscribe(() => {
      this.unsubscribeAll();
      this.fetchASEs();
    });
  }

  fetchASEs() {
    this.fetchingASEs.next(true);
    this.fueltypesArray.forEach((fueltype) => {
      if (!this.depotsservice.activedepot.value.depot.Id) {
        return;
      }
      const subscriprion = this.db.firestore.collection("omc")
        .doc(this.omc.currentOmc.value.Id)
        .collection("ase")
        .orderBy("date", "asc")
        .where("status", "==", 1)
        .where("fuelType", "==", fueltype)
        .onSnapshot(snapshot => {
          this.fetchingASEs.next(false);
          // if(!snapshot.empty) console.log(snapshot.docs[0].data())
          this.depotASEs[fueltype].next(snapshot.docs.map(doc => {
            const value = Object.assign({}, emptyASEs, doc.data());
            value.Id = doc.id;
            return value as ASE;
          }));
        });
      this.subscriptions.set(`${fueltype}ase`, subscriprion);
    });
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  getASEs(type: FuelType) {

    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("ase")
      .where("fuelType", "==", type)
      .orderBy("status", "desc");
  }

  updateASE(ASEId: string) {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("ase")
      .doc(ASEId);
  }
}
