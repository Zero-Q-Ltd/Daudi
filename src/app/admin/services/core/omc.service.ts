import { Injectable } from "@angular/core";
import { AngularFirestore, QueryFn } from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { emptyomc, OMC } from "../../../models/Daudi/omc/OMC";

@Injectable({
  providedIn: "root"
})
export class OmcService {

  constructor(
    private db: AngularFirestore, ) {
  }


  getomcs(queryFn: QueryFn) {

    return this.db.collection<OMC[]>("omc", queryFn).snapshotChanges()
      .pipe(map(t => {
        return t.map(data => {
          return { ...emptyomc, ...{ Id: data.payload.doc.id }, ...data.payload.doc.data() };
        });

      }
      ));
  }
}
