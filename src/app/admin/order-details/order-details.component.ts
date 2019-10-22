// import { BatchSelectorComponent } from './../batch-selector/batch-selector.component';
import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {MatDialog} from "@angular/material"; //added dialog data receive
import {NotificationService} from "../../shared/services/notification.service";
import {AngularFirestore} from "@angular/fire/firestore";
import {Truck_} from "../../models/Truck";
import {Order_} from "../../models/Order";
import {TrucksService} from "../services/trucks.service";
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

  truck: Truck_;
  displayedColumns = ["Id", "Company", "Contact", "Time", "Phone", "PMS", "AGO", "IK", "Total", "Action", "Status"];
  @Input() order: Order_;

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private dialog: MatDialog,
              private db: AngularFirestore,
              private truckservice: TrucksService,
              private notificationService: NotificationService) {
    if (!this.order) {
      return;
    }
    let subscription = this.truckservice.getTruck(this.order.Id).onSnapshot(truckdata => {
      this.truck = truckdata.data() as Truck_;
    });
    this.subscriptions.set(`statsrange`, subscription);

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
    console.log(this.order);
  }
}
