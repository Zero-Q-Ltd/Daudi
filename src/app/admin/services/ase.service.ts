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
    this.ASECollection("Tf84xilXZ2MP3jaGEsBs").onSnapshot(ase => {
      console.log(ase.empty, ase.docs.map(t => t.data()));
    });
  }

  ASECollection(omcId: string) {
    return this.db.firestore.collection("omc")
      .doc(omcId)
      .collection("ase");
  }


  getASEs(omcId: string, type: FuelType) {

    return this.ASECollection(omcId)
      .where("fuelType", "==", type)
      .orderBy("active", "desc");
  }

  updateASE(omcId: string, ASEId: string) {
    return this.ASECollection(omcId)
      .doc(ASEId);
  }
}
