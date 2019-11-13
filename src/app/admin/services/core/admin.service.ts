import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin, emptyadmin } from "../../../models/admin/Admin";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { AngularFireAuth } from "@angular/fire/auth";
import * as moment from "moment";
import { User } from "../../../models/universal/User";
import { firestore } from "firebase";
import { Router } from "@angular/router";
import { AngularFireDatabase } from "@angular/fire/database";
import { take } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class AdminService {
  /**
   * The only source of truth
   */
  observableuserdata = new ReplaySubject<Admin>(1);
  /**
   * Secondary copy of data to avoid many unnecessary subscriptions
   */

  userdata: Admin = { ...emptyadmin };


  constructor(private db: AngularFirestore, private afAuth: AngularFireAuth, router: Router) {
    afAuth.authState.subscribe(state => {
      if (state) {
        this.getuser(afAuth.auth.currentUser);
      } else {
        this.userdata = { ...emptyadmin };
        if (router.routerState.snapshot.url !== "/admin/login") {
          router.navigate(["/admin/login"]);
        }
        this.observableuserdata.next(null);
      }
    });

    this.observableuserdata.subscribe(userdata => {
      this.userdata = userdata;
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
      name: this.userdata.profile.name,
      uid: this.userdata.profile.uid,
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
        } else {
          this.observableuserdata.next(null);
        }

      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    if (unsub) {
      unsubscribe();
    }
  }



  unsubscribeAll() {
    this.getuser(null);
  }
}
