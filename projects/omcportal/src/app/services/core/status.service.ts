import {Injectable} from '@angular/core';
import {AngularFireDatabase} from '@angular/fire/database';
import {BehaviorSubject} from 'rxjs';
import {take} from 'rxjs/operators';
import {AdminService} from './admin.service';

@Injectable({
  providedIn: 'root'
})
/**
 * This combines rtdb and cloud functions to simulate online offline status
 * By conditionally updating a node in rtdb and triggering a cloud fxn to copy over the changes to firestore, we bridge the gap
 */
export class StatusService {

  connectionStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  constructor(
    private rtdb: AngularFireDatabase,
    private admin: AdminService
  ) {
    /**
     * only create an rtdl entry if the user actually exists in the database
     * Just take the first emmision and use that to create the object
     */
    this.admin.observableuserdata.pipe(take(1)).subscribe(admindata => {
      /**
       * Keep the online status active
       */
      const userStatusDatabaseRef = this.rtdb.database.ref('/admin/' + admindata.Id);
      const isOfflineForDatabase = {
        online: false
      };
      const isOnlineForDatabase = {
        online: true
      };
      this.rtdb.database.ref('.info/connected').on('value', result => {
        if (result.val() === false) {
          userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase);
          this.connectionStatus.next(false);
          return;
        } else {
          userStatusDatabaseRef.set(isOnlineForDatabase);
          this.connectionStatus.next(true);
        }
      });
    });

  }
}
