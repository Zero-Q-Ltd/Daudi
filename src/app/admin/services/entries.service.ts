import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { BehaviorSubject } from "rxjs";
import { skipWhile, map } from "rxjs/operators";
import { emptyEntries, Entry } from "../../models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { CoreService } from "./core/core.service";
import { DepotService } from "./core/depot.service";
import { OmcService } from "./core/omc.service";

@Injectable({
  providedIn: "root"
})
export class EntriesService {

  constructor(
    private db: AngularFirestore,
    private core: CoreService) {

  }

  fetchEntries(queryFn: QueryFn) {
    return this.db.collection<Entry>("omc", queryFn)
      .doc(this.core.currentOmc.value.Id)
      .collection("entry")
      .snapshotChanges()
      .pipe(map(t => {
        return {
          ...t.map(data => {
            return {
              ...emptyEntries, ...{ Id: data.payload.doc.id }, ...data.payload.doc.data()
            };
          })
        };
      }
      ));
  }



  getAllEntries(type: FuelType) {
    return this.db.firestore.collection("omc")
      .doc(this.core.currentOmc.value.Id)
      .collection("entry")
      .where("fuelType", "==", type)
      .orderBy("active", "desc");
  }

  updateEntry(entryId: string) {
    return this.db.firestore.collection("omc")
      .doc(this.core.currentOmc.value.Id)
      .collection("entry")
      .doc(entryId);
  }
}
