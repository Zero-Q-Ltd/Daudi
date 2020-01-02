import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { DepotService } from "./core/depot.service";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { OmcService } from "./core/omc.service";
import { skipWhile, map } from "rxjs/operators";
import { ASE, emptyASEs } from "../../models/Daudi/fuel/ASE";
import { CoreService } from "./core/core.service";

@Injectable({
  providedIn: "root"
})
export class AseService {

  constructor(
    private db: AngularFirestore, ) {

  }

  fetchASEs(omcid: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("ase");
    // .snapshotChanges()
    // .pipe(map(t => {
    //   return t.map(data => {
    //     return {
    //       ...emptyASEs, ...{ Id: data.payload.doc.id }, ...data.payload.doc.data()
    //     };
    //   });
    // }
    // ));
  }


  getASEs(omcid: string, type: FuelType) {

    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("ase")
      .where("fuelType", "==", type)
      .orderBy("active", "desc");
  }

  updateASE(omcid: string, ASEId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("ase")
      .doc(ASEId);
  }
}
