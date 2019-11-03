import { Injectable } from "@angular/core";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { BehaviorSubject } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";
import { Admin } from "../../models/admin/Admin";
import { NotificationService } from "../../shared/services/notification.service";
import { FCM } from "../../models/notification/FCM";
import { distinctUntilChanged } from "rxjs/operators";
import { AdminService } from "./core/admin.service";

@Injectable({
  providedIn: "root"
})
export class FcmService {
  currentMessage = new BehaviorSubject(null);

  constructor(private db: AngularFirestore,
    private afMessaging: AngularFireMessaging,
    private notification: NotificationService,
    private adminservice: AdminService) {
    this.adminservice.observableuserdata
      .pipe(distinctUntilChanged())
      .subscribe(admin => {
        if (admin) {
          this.requestPermission(admin);
          this.receiveMessage();
        }
      });
  }

  updateusertokes(user: Admin, token) {
    if (user.fcmtokens.web !== token) {
      this.db.firestore.collection("admins").doc(user.Id).update({ "fcmtokens.web": token });
    }
  }

  requestPermission(user: Admin) {
    this.afMessaging.requestToken.subscribe(
      (token) => {
        this.updateusertokes(user, token);
      },
      (err) => {
        console.error("Unable to get permission to notify.", err);
      }
    );
  }

  receiveMessage() {
    this.afMessaging.messages.subscribe(
      (payload: FCM) => {
        // console.log('new message received. ', payload);
        switch (payload.notification.title) {
          case "Payment Received":
            return this.notification.notify({
              alert_type: "cash",
              duration: 5000,
              title: payload.notification.title,
              body: payload.notification.body
            });
          case "Unprocessed Payment":
            return this.notification.notify({
              alert_type: "unprocessedpayment",
              duration: 5000,
              title: payload.notification.title,
              body: payload.notification.body
            });
          default:
            return null;
        }
      });
  }
}
