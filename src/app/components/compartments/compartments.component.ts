import {Component, Inject, OnDestroy, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material'; // added dialog data
import {ReplaySubject} from 'rxjs';
import {FuelNamesArray, FuelType} from '../../models/Daudi/fuel/FuelType';
import {EmptyGenericTruckStage} from '../../models/Daudi/order/GenericStage';
import {Order} from '../../models/Daudi/order/Order';
import {deepCopy} from '../../models/utils/deepCopy';
import {AdminService} from '../../services/core/admin.service';
import {DepotService} from '../../services/core/depot.service';
import {OrdersService} from '../../services/orders.service';
import {NotificationService} from '../../shared/services/notification.service';
import {OrderDetailsComponent} from '../order-details/order-details.component';

@Component({
  selector: 'compartments',
  templateUrl: './compartments.component.html',
  styleUrls: ['./compartments.component.scss']
})
export class CompartmentsComponent implements OnInit, OnDestroy {
  position = 'left';
  position2 = 'above';
  saving = false;
  // @Input() order: Order;
  mask = [/^[kK]+$/i, /^[a-zA-Z]+$/i, /^[a-zA-Z]+$/i, ' ', /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];
  fueltypesArray = FuelNamesArray;
  nameControl: FormControl = new FormControl('', [Validators.required]);
  IdControl: FormControl = new FormControl('', [Validators.required]);
  plateControl: FormControl = new FormControl('', [Validators.required, Validators.pattern(this.mask[0])]);

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  /**
   * Keeps the total loaded of each fueltypes across different compartments
   */
  temporaryQuantities: {
    [key in FuelType]: number
  } = {
    ago: 0,
    ik: 0,
    pms: 0
  };
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  /**
   * We dont want to mutate the original order data sent from the table
   */
  order: Order;

  // added to constructor to inject the data
  constructor(
    @Inject(MAT_DIALOG_DATA) public _order: Order,
    private notification: NotificationService,
    private orderservice: OrdersService,
    private depotservice: DepotService,
    private dialogRef: MatDialogRef<OrderDetailsComponent>,
    private adminservice: AdminService) {
    /**
     * Copy the data in a way that avoids mutation
     */
    this.order = deepCopy(_order);
    for (let i = 0; i < 7; i++) {
      this.order.truck.compartments[i] = {
        position: i,
        fueltype: null,
        qty: 0,
      };
    }
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
    /**
     * Calculate the totals ever time the compartment volume changes
     */
    this.temporaryQuantities = {
      ago: 0,
      ik: 0,
      pms: 0
    };
    this.order.truck.compartments.forEach(compartment => {
      this.temporaryQuantities[compartment.fueltype] += compartment.qty;
    });
  }

  checkvalidity() {
    // if(this.nameControl.valid && this.IdControl.valid && this.plateControl.valid){
    let errorcheck = false;
    /**
     * Check total fuel loaded
     */
    this.fueltypesArray.forEach(fueltype => {

      if (Number(this.order.fuel[fueltype].qty) !== this.temporaryQuantities[fueltype]) {
        errorcheck = true;
        this.notification.notify({
          alert_type: 'error',
          duration: 2000,
          title: 'Error',
          icon: 'invert_colors_off',
          body: `Invalid ${fueltype} Total Amount`
        });
      }
    });
    /**
     * Check driver details
     */
    if (!this.order.truck.driverdetail.name || this.order.truck.driverdetail.name.length < 4) {
      this.notification.notify({
        alert_type: 'error',
        duration: 2000,
        title: 'Error',
        icon: 'invert_colors_off',
        body: `Driver name required`
      });
      errorcheck = true;
    }
    if (errorcheck) {
      return false;
    } else {
      this.order.truckStageData[0] = {...EmptyGenericTruckStage};
      this.order.truckStageData[0].expiry[0].user = this.adminservice.createuserobject();
      this.order.truck.truckdetail.numberplate = this.order.truck.truckdetail.numberplate ? this.order.truck.truckdetail.numberplate.toUpperCase() : null;
      this.order.truck.driverdetail.name = this.order.truck.driverdetail.name ? this.order.truck.driverdetail.name.toUpperCase() : null;

      this.order.truck.stage = 0;
      this.order.loaded = true;
      return this.dialogRef.close({order: this.order, truck: this.order.truck});
    }
  }

  reset() {
    this.order = deepCopy(this._order);
  }

}
