import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/firestore";

@Injectable({
  providedIn: 'root'
})
export class SmsService {

  constructor(private db: AngularFirestore,) {
  }

  createsms() {
    return this.db.firestore.collection("sms").doc(this.db.createId());
  }


  getsmslogs() {
    return this.db.firestore.collection("sms")
      .orderBy("timestamp", "desc")
      .limit(1000);
  }
}
