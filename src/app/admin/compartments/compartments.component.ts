import { OrderDetailsComponent } from "../order-details/order-details.component";
import { Component, Inject, OnDestroy, OnInit, Input } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material"; // added dialog data
import { NotificationService } from "../../shared/services/notification.service";
import { FormControl, Validators } from "@angular/forms";
import { Order } from "../../models/Daudi/order/Order";
import { emptytruck, Truck } from "../../models/Daudi/order/Truck";
import { AdminService } from "../services/core/admin.service";
import { OrdersService } from "../services/orders.service";
import { DepotService } from "../services/core/depot.service";
import { ReplaySubject } from "rxjs";
import { FuelType } from "../../models/Daudi/fuel/fuelTypes";

@Component({
  selector: "compartments",
  templateUrl: "./compartments.component.html",
  styleUrls: ["./compartments.component.scss"]
})
export class CompartmentsComponent implements OnInit, OnDestroy {
  position = "left";
  position2 = "above";
  saving = false;
  @Input() order: Order;
  mask = [/^[kK]+$/i, /^[a-zA-Z]+$/i, /^[a-zA-Z]+$/i, " ", /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];
  fueltypesArray = Object.keys(FuelType);
  nameControl: FormControl = new FormControl("", [Validators.required]);
  IdControl: FormControl = new FormControl("", [Validators.required]);
  plateControl: FormControl = new FormControl("", [Validators.required, Validators.pattern(this.mask[0])]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  // added to constructor to inject the data
  constructor(
    private notification: NotificationService,
    private orderservice: OrdersService,
    private depotservice: DepotService,
    private dialogRef: MatDialogRef<OrderDetailsComponent>,
    private adminservice: AdminService) {

  }


  ngOnInit() {

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

  setfueltype(index: number, fueltype) {
    this.order.truck.compartments[index].fueltype = fueltype;
    this.fueltypesArray.forEach(type => {
      this.order.fuel[type].qty = 0;
    });
    this.order.truck.compartments.forEach((compartment, _) => {
      if (compartment.fueltype != null) {
        this.order.fuel[compartment.fueltype].qty += compartment.qty;
      }
    });
  }

  checkvalidity() {
    // if(this.nameControl.valid && this.IdControl.valid && this.plateControl.valid){
    let errorcheck = false;
    this.fueltypesArray.forEach(fueltype => {
      if (Number(this.order.fuel[fueltype].qty) !== Number(this.order.fuel[fueltype].qty)) {
        errorcheck = true;
        this.notification.notify({
          alert_type: "error",
          duration: 2000,
          title: "Error",
          icon: "invert_colors_off",
          body: `Invalid ${fueltype} Total Amount`
        });
      }
    });
    if (!this.order.truck.driverdetail.name || this.order.truck.driverdetail.name.length < 4) {
      this.notification.notify({
        alert_type: "error",
        duration: 2000,
        title: "Error",
        icon: "invert_colors_off",
        body: `Driver name required`
      });
      errorcheck = true;
    }
    if (errorcheck) {
      return false;
    } else {

      this.order.truck.stagedata[0].user = this.adminservice.createuserobject();
      // this.order.truck.numberplate = this.order.truck.numberplate ? this.order.truck.numberplate.toUpperCase() : null;
      // this.order.truck.drivername = this.order.truck.drivername ? this.order.truck.drivername.toUpperCase() : null;

      // this.order.truck.notifications = this.order.notifications;
      this.order.truck.stage = 0;
      // this.order.truck.isPrinted = false;

      this.order.loaded = true;
      return this.dialogRef.close({ order: this.order, truck: this.order.truck });
    }
  }

  reset() {
    this.order.truck.compartments.forEach((compartment, index) => {
      compartment.fueltype = null;
      compartment.qty = 0;
    });
    this.setfueltype(1, null);
  }

}
