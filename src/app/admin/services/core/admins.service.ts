import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin, emptyadmin } from "../../../models/Admin";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import * as moment from "moment";
import { User } from "../../../models/universal";
import { firestore } from "firebase";
import { Router } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/database";

@Injectable({
  providedIn: "root"
})
export class AdminsService {
  userdata: Admin = Object.assign({}, emptyadmin);
  observableuserdata = new ReplaySubject<Admin>(1);
  connectionStatus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  authroken: BehaviorSubject<string> = new BehaviorSubject<string>("");

  constructor(private db: AngularFirestore, private rtdb: AngularFireDatabase, private afAuth: AngularFireAuth, router: Router) {
    afAuth.authState.subscribe(state => {
      if (state) {
        this.getuser(afAuth.auth.currentUser);
        afAuth.auth.currentUser.getIdToken().then(res => {
          this.authroken.next(res);
        });
        /**
         * Keep the online status active
         */
        const userStatusDatabaseRef = this.rtdb.database.ref("/admins/" + afAuth.auth.currentUser.uid);
        const isOfflineForDatabase = {
          online: false
        };
        const isOnlineForDatabase = {
          online: true
        };
        this.rtdb.database.ref(".info/connected").on("value", result => {
          if (result.val() === false) {
            userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase);
            this.connectionStatus.next(false);
            return;
          } else {
            userStatusDatabaseRef.set(isOnlineForDatabase);
            this.connectionStatus.next(true);
          }
        });
      } else {
        this.userdata = emptyadmin;
        if (router.routerState.snapshot.url !== "/admin/login") {
          router.navigate(["/admin/login"]);
        }
        this.observableuserdata.next(null);
      }
    });
  }

  /**
   * make the user go offline before logging out
   */
  logoutsequence() {
    this.db.firestore.collection("admins").doc(this.userdata.Id).update({
      status: {
        online: false,
        time: moment().toDate()
      }
    }).then(res => {
      this.afAuth.auth.signOut();
    });
  }

  getalladmins() {
    return this.db.firestore.collection("admins")
      .where("Active", "==", true);
  }

  /**
   * Creates a user object for use within orders and trucks
   */
  createuserobject(): User {
    return {
      name: this.userdata.data.name,
      uid: this.userdata.data.uid,
      time: firestore.Timestamp.now()
    };
  }

  updateadmin(adminid: string) {
    return this.db.firestore.collection("admins").doc(adminid);
  }

  getuser(user, unsub?: boolean) {
    // console.log(user);
    const unsubscribe = this.db.firestore.collection("admins").doc(user.uid)
      .onSnapshot(userdata => {
        if (userdata.exists) {

          const tempdata = Object.assign({}, emptyadmin, userdata.data());
          tempdata.data.email = user.email;
          tempdata.data.name = user.displayName;
          tempdata.data.photoURL = user.photoURL;
          tempdata.data.uid = user.uid;
          tempdata.Id = user.uid;

          this.userdata = tempdata;
          this.observableuserdata.next(tempdata);
          // this.fetchdepots();
          // this.msg.requestPermission(tempdata);
          // this.msg.receiveMessage();
        } else {
          this.checkinvite(user);
          this.observableuserdata.next(null);
        }

      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    if (unsub) {
      unsubscribe();
    }
  }

  /**
   * Checks whether a user has a pending invite
   * @param user
   */
  checkinvite(user) {
    this.db.firestore.collection("userinvites")
      .where("email", "==", user.email)
      .limit(1)
      .get().then(snapshot => {
        snapshot.forEach(docdata => {
          this.db.collection(`users`).doc(user.uid).set(docdata.data());
        });
      }, error => {
        console.log("Error verifying invite");
      });
  }

  unsubscribeAll() {
    this.getuser(null);
  }
}
