import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { ReplaySubject, Observable, BehaviorSubject } from "rxjs";
import { Resolve } from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthService implements Resolve<Promise<any>> {
  /**
   * The only source of truth
   */
  observableuserdata = new BehaviorSubject<firebase.User>(null);

  constructor(private afAuth: AngularFireAuth) {
    afAuth.authState.subscribe(state => {
      console.log(afAuth.auth.currentUser);
      this.observableuserdata.next(afAuth.auth.currentUser);
    });
  }
  resolve() {
    return this.afAuth.auth.signInAnonymously();
  }
}
