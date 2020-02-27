import { Component, Inject, OnInit } from '@angular/core';
import { Alert } from '../../../models/Daudi/notification/Alert';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})

export class NotificationComponent implements OnInit {

  constructor(@Inject(MAT_SNACK_BAR_DATA) public notificationdata: Alert) {
  }

  ngOnInit() {
  }

}
