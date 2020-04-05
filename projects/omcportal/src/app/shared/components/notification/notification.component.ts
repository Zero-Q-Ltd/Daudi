import { Component, Inject, OnInit } from "@angular/core";
import { MAT_SNACK_BAR_DATA } from "@angular/material/snack-bar";
import { Alert } from "../../../models/Daudi/notification/Alert";

@Component({
  selector: "app-notification",
  templateUrl: "./notification.component.html",
  styleUrls: ["./notification.component.scss"]
})

export class NotificationComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public notificationdata: Alert) {
  }

  ngOnInit() {
  }

}
