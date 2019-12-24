import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { OmcService } from "./core/omc.service";

@Injectable({
  providedIn: "root"
})
export class SmsService {

  constructor(private db: AngularFirestore, private omc: OmcService) {
  }

  createsms() {
    return this.db.firestore.collection("omc")
      .doc(this.omc.currentOmc.value.Id)
      .collection("sms").doc(this.db.createId());
  }


  getsmslogs() {
    return this.db.firestore.collection("sms")
      .orderBy("MyTimestamp", "desc")
      .limit(1000);
  }
}
