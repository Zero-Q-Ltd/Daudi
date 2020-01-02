import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { OmcService } from "./core/omc.service";

@Injectable({
  providedIn: "root"
})
export class SmsService {

  constructor(private db: AngularFirestore, private omc: OmcService) {
  }

  createsms(omcid: string) {
    return this.db.firestore.collection("omc")
      .doc(omcid)
      .collection("sms").doc(this.db.createId()).onSnapshot();
  }


  getsmslogs() {
    return this.db.firestore.collection("sms")
      .orderBy("MyTimestamp", "desc")
      .limit(1000);
  }
}
