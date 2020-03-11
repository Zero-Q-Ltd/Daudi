import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FuelType } from 'app/models/Daudi/fuel/FuelType';

@Injectable({
  providedIn: 'root'
})
export class AseService {

  constructor(
    private db: AngularFirestore, ) {
  }

  ASECollection(omcId: string) {
    return this.db.firestore.collection('omc')
      .doc(omcId)
      .collection('ases');
  }


  updateASE(omcId: string, ASEId: string) {
    return this.ASECollection(omcId)
      .doc(ASEId);
  }
}
