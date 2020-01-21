import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { SMS } from 'app/models/Daudi/sms/sms';
import { OmcService } from "./core/omc.service";

@Injectable({
    providedIn: 'root'
})
export class SmsService {

    constructor(private db: AngularFirestore, private omc: OmcService) {
    }

    createsms(omcId: string, sms: SMS) {
        return this.smsCollection(omcId).add(sms);
    }

    smsCollection(omcId: string) {
        return this.db.firestore.collection('omc')
            .doc(omcId)
            .collection('sms');
    }

    getsmslogs() {
        return this.db.firestore.collection('sms')
            .orderBy('MyTimestamp', 'desc')
            .limit(1000);
    }
}
