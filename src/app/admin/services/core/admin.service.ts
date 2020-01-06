import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { AngularFirestore } from "@angular/fire/firestore";
import { Router } from "@angular/router";
import * as moment from "moment";
import { ReplaySubject } from "rxjs";
import { Admin, emptyadmin } from "../../../models/Daudi/admin/Admin";
import { AssociatedUser } from "../../../models/Daudi/admin/AssociatedUser";
import { MyTimestamp } from "../../../models/firestore/firestoreTypes";


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
      console.log(userdata);
      // this.createUser();
      this.userdata = userdata;
    });
  }

  /**
   * make the user go offline before logging out
   */
  logoutsequence() {
    this.db.firestore.collection("admin").doc(this.userdata.Id).update({
      status: {
        online: false,
        time: moment().toDate()
      }
    }).then(res => {
      this.afAuth.auth.signOut();
    });
  }

  getalladmins() {
    return this.db.firestore.collection("admin")
      .where("Active", "==", true);
  }

  /**
   * Creates a user object for use within orders and trucks
   */
  createuserobject(): AssociatedUser {
    return {
      name: this.userdata.profile.name,
      adminId: this.userdata.profile.uid,
      date: MyTimestamp.now()
    };
  }

  updateadmin(admin: Admin) {
    return this.db.firestore.collection("admin").doc(admin.Id).update(admin);
  }

  getuser(user, unsub?: boolean) {
    const unsubscribe = this.db.firestore.collection("admin").doc(user.uid)
      .onSnapshot(userdata => {
        if (userdata.exists) {

          const temp: Admin = Object.assign({}, { ...emptyadmin }, userdata.data());
          temp.profile.email = user.email;
          temp.profile.name = user.displayName;
          temp.profile.photoURL = user.photoURL;
          temp.Id = userdata.id;
          this.userdata = temp;
          this.observableuserdata.next(temp);
          console.log(temp);
        } else {
          console.log("User not found!!");
          this.observableuserdata.next(null);
        }

      }, err => {
        console.log(`Encountered error: ${err}`);
      });
    if (unsub) {
      unsubscribe();
    }

  }

  createUser() {
    this.db.firestore.collection("admin").doc("hyNsgvX1x5emqZS3W6xqcyGifjh1").set(emptyadmin);
  }

  unsubscribeAll() {
    this.getuser(null);
  }
}
