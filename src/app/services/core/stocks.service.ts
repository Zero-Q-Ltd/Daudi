import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class StocksService {

  constructor(private db: AngularFirestore) {

  }

  stockDoc(omcId: string, depotId: string) {
    return this.db.firestore.collection('omc')
      .doc(omcId)
      .collection('stock')
      .doc(depotId);
  }
}
