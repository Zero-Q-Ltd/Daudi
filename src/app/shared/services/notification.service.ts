import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Alert } from "../../models/Daudi/notification/Alert";
import { MatSnackBar } from "@angular/material";
import { Howl } from "howler";
import { NotificationComponent } from "../notification/notification.component";

@Injectable({
  providedIn: "root"
})
export class NotificationService {
  private notificationSubject = new Subject<Alert>();

  constructor(public snackBar: MatSnackBar) {
    this.notificationSubject.subscribe((alert: Alert) => {
      if (alert.alert_type) {
        const config = NotificationService.getsrc(alert);
        const sound = new Howl({
          src: [config.soundsrc]
        });
        alert.icon = alert.icon || config.icon;
        sound.play();
      }

      this.snackBar.openFromComponent(NotificationComponent, {
        duration: alert.duration ? alert.duration : 2000,
        data: alert,
        panelClass: ["blue-snackbar"]
      });
    });
  }

  private static getsrc(alert: Alert) {
    switch (alert.alert_type) {
      case "cash":
        return {
          icon: "attach_money",
          soundsrc: "../../../assets/sounds/cash.ogg"
        };
      case "notify":
        return {
          icon: "info",
          soundsrc: "../../../assets/sounds/drip.ogg"
        };
      case "success":
        return {
          icon: "done_outline",
          soundsrc: "../../../assets/sounds/drums.ogg"
        };
      case "msgnew":
        return {
          icon: "chat",
          soundsrc: "../../../assets/sounds/msgnew.ogg"
        };
      case "error":
        return {
          icon: "error",
          soundsrc: "../../../assets/sounds/sonar.ogg"
        };
      case "alert":
        return {
          icon: "",
          soundsrc: "../../../assets/sounds/notify.mp3"
        };
      case "warning":
        return {
          icon: "warning",
          soundsrc: "../../../assets/sounds/glass.ogg"
        };
      /**
       * TODO : Look for a better audio
       */
      case "unprocessedpayment":
        return {
          icon: "warning",
          soundsrc: "../../../assets/sounds/cash.ogg"
        };

    }
  }

  notify(alert: Alert) {
    this.notificationSubject.next(alert);
  }
}
