// import { BatchSelectorComponent } from './../batch-selector/batch-selector.component';
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material"; // added dialog data receive
import {NotificationService} from "../../shared/services/notification.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {Truck} from "../../models/Daudi/order/truck/Truck";
import {ReplaySubject} from "rxjs";

@Component({
  selector: "order-details",
  templateUrl: "./order-details.component.html",
  styleUrls: ["./order-details.component.scss"]
})
export class OrderDetailsComponent implements OnInit, OnDestroy {

  position = "right";
  position1 = "left";
  position2 = "above";

  displayedColumns = ["Id", "Company", "Contact", "Time", "Phone", "PMS", "AGO", "IK", "Total", "Action", "Status"];
  @Input() truck: Truck;

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private dialog: MatDialog,
    private db: AngularFirestore,
    private notificationService: NotificationService) {
    if (!this.truck) {
      return;
    }


  }


  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  ngOnInit() {
    console.log(this.truck);
  }
}
