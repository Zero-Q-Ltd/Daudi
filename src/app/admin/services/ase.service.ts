import {Injectable} from "@angular/core";
import {AngularFirestore} from "@angular/fire/firestore";
import {FuelType} from "../../models/Daudi/fuel/FuelType";

@Injectable({
  providedIn: "root"
})
export class AseService {

  constructor(
    private db: AngularFirestore, ) {
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
