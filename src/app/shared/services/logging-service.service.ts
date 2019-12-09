import { Injectable } from "@angular/core";
import * as firebase from "firebase";
import { AngularFirestore } from "@angular/fire/firestore";

@Injectable()
export class LoggingService {
  testing: Boolean = true;

  constructor(public af: AngularFirestore) {
  }

  log(params: Object) {
    console.log(params);
    params["time"] = firebase.database.ServerValue.MyTimestamp;
    params["status"] = "new";
    if (!this.testing) {
      // this.af.doc(`Errors`). (params);
    }
  }
}
