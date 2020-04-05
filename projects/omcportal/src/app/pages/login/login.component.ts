import { Component, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { AdminService } from "app/services/core/admin.service";
import * as firebase from "firebase";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { NotificationService } from "../../shared/services/notification.service";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"]
})
export class LoginComponent implements OnInit {
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private router: Router,
    private adminservice: AdminService,
    private afAuth: AngularFireAuth,
    private notification: NotificationService) {
    this.adminservice.observableuserdata.pipe(takeUntil(this.comopnentDestroyed)).subscribe(data => {
      console.log(data);
      if (data) {
        if (data.config.level === 5) {
          this.router.navigate(["/editprice"]);
        } else {
          this.router.navigate(["/"]);
        }
      } else {
        if (router.routerState.snapshot.url !== "/login") {
          this.notification.notify({
            body: "You are not authenticated to view this page",
            duration: 3000,
            alert_type: "warning",
            title: "Warning"
          });
        }
      }
    });
  }

  ngOnInit() {
  }

  loginWithGoogle() {
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    // this.authService.loginGoogle();
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

}
