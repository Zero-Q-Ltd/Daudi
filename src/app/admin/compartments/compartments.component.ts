import { OrderDetailsComponent } from "../order-details/order-details.component";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material"; // added dialog data
import { NotificationService } from "../../shared/services/notification.service";
import { FormControl, Validators } from "@angular/forms";
import { Order } from "../../models/Order";
import { emptytruck, Truck_ } from "../../models/Truck";
import { AdminsService } from "../services/admins.service";
import { fueltypesArray } from "../../models/Fueltypes";
import { OrdersService } from "../services/orders.service";
import { DepotsService } from "../services/depots.service";
import { ReplaySubject } from "rxjs";

@Component({
  selector: "compartments",
  templateUrl: "./compartments.component.html",
  styleUrls: ["./compartments.component.scss"]
})
export class CompartmentsComponent implements OnInit, OnDestroy {
  position = "left";
  position2 = "above";
  saving = false;
  truck: Truck_ = Object.assign({}, emptytruck);
  mask = [/^[kK]+$/i, /^[a-zA-Z]+$/i, /^[a-zA-Z]+$/i, " ", /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];
  fueltypesArray = fueltypesArray;
  nameControl: FormControl = new FormControl("", [Validators.required]);
  IdControl: FormControl = new FormControl("", [Validators.required]);
  plateControl: FormControl = new FormControl("", [Validators.required, Validators.pattern(this.mask[0])]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  // added to constructor to inject the data
  constructor(@Inject(MAT_DIALOG_DATA) public order: Order,
    private notification: NotificationService,
    private orderservice: OrdersService,
    private depotservice: DepotsService,
    private dialogRef: MatDialogRef<OrderDetailsComponent>,
    private adminservice: AdminsService) {

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
    this.truck.compartments[index].fueltype = fueltype;
    fueltypesArray.forEach(type => {
      this.truck.fuel[type].qty = 0;
    });
    this.truck.compartments.forEach((compartment, _) => {
      if (compartment.fueltype != null) {
        this.truck.fuel[compartment.fueltype].qty += compartment.qty;
      }
    });
  }

  checkvalidity() {
    // if(this.nameControl.valid && this.IdControl.valid && this.plateControl.valid){
    let errorcheck = false;
    fueltypesArray.forEach(fueltype => {
      if (Number(this.order.fuel[fueltype].qty) !== Number(this.truck.fuel[fueltype].qty)) {
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
    if (!this.truck.drivername || this.truck.drivername.length < 4) {
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
      this.truck.orderdata = {
        QbID: this.order.QbId,
        OrderID: this.order.Id
      };
      this.truck.stagedata[0].user = this.adminservice.createuserobject();
      this.truck.numberplate = this.truck.numberplate ? this.truck.numberplate.toUpperCase() : null;
      this.truck.drivername = this.truck.drivername ? this.truck.drivername.toUpperCase() : null;

      this.truck.notifications = this.order.notifications;
      this.truck.stage = 0;
      this.truck.isPrinted = false;
      this.truck.company = {
        QbId: this.order.company.QbId,
        contactname: this.order.company.contact.name,
        Id: this.order.company.Id,
        name: this.order.company.name,
        phone: this.order.company.contact.phone
      };
      this.truck.config = {
        depot: {
          name: this.depotservice.activedepot.value.Name,
          Id: this.depotservice.activedepot.value.Id
        },
        companyid: this.depotservice.activedepot.value.companyId,
        sandbox: this.depotservice.activedepot.value.sandbox
      };
      this.truck.Id = this.order.Id;
      this.order.loaded = true;
      return this.dialogRef.close({ order: this.order, truck: this.truck });
    }
  }

  reset() {
    this.truck.compartments.forEach((compartment, index) => {
      compartment.fueltype = null;
      compartment.qty = 0;
    });
    this.setfueltype(1, null);
  }

}
