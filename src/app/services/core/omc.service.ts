import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class OmcService {

  constructor(
    private db: AngularFirestore, ) {
  }

  omcCollection() {
    return this.db.firestore.collection('omc');
  }

  omcStockCollection(imcId: string) {
    return this.db.firestore.collection('omc')
      .doc('values')
      .collection('stock');
  }
}
