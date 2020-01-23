import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Entry} from 'app/models/Daudi/fuel/Entry';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {

  constructor(
    private db: AngularFirestore) {

  }

  entryCollection(omcId: string) {
    return this.db.firestore.collection('omc')
      .doc(omcId)
      .collection('entries');
  }

  updateEntry(omcId: string, entry: Entry) {
    return this.entryCollection(omcId)
      .doc(entry.Id)
      .update(entry);
  }
}
