import { Component, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { Entry, EntryDraw } from "app/models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "app/models/Daudi/fuel/FuelType";
import { newStock, Stock } from "app/models/Daudi/omc/Stock";
import { emptyorder, Order } from "app/models/Daudi/order/Order";
import { deepCopy } from "app/models/utils/deepCopy";
import { AdminService } from "app/services/core/admin.service";
import { CoreService } from "app/services/core/core.service";
import { StocksService } from "app/services/core/stocks.service";
import { EntriesService } from "app/services/entries.service";
import { OrdersService } from "app/services/orders.service";
import { NotificationService } from "app/shared/services/notification.service";
import * as moment from "moment";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  templateUrl: "./entry-assign.component.html",
  styleUrls: ["./entry-assign.component.scss"]
})
export class EntryAssignComponent implements OnInit {
  order: Order = { ...emptyorder };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  fueltypesArray = FuelNamesArray;
  selectedEntries: {
    [key in FuelType]: (Entry & EntryDraw)[]
  } = {
      ago: [],
      ik: [],
      pms: []
    };

  validEntryForms: {
    [key in FuelType]: boolean
  } = {
      ago: false,
      ik: false,
      pms: false
    };

  validTotals: {
    [key in FuelType]: boolean
  } = {
      ago: false,
      ik: false,
      pms: false
    };

  saving = false;
  validAllForms = false;
  validAllTotals = false;
  subscriptions: Map<string, () => void> = new Map<string, any>();
  stock: Stock = newStock();
  constructor(
    public dialogRef: MatDialogRef<EntryAssignComponent>,
    @Inject(MAT_DIALOG_DATA) private orderId: string,
    private core: CoreService,
    private notification: NotificationService,
    private ordersservice: OrdersService,
    private db: AngularFirestore,
    private stockService: StocksService,
    private entriesService: EntriesService,
    private adminservice: AdminService
  ) {
    this.core.stock.subscribe(stock => {
      this.stock = stock;
    });
    const ordersubscription = this.ordersservice.getOrder(orderId, core.currentOmc.value.Id)
      .onSnapshot(orderSnapshot => {
        if (orderSnapshot.exists) {
          this.order = Object.assign({}, orderSnapshot.data()) as Order;
          this.order.Id = orderSnapshot.id;
          FuelNamesArray.forEach(fuel => {
            if (this.order.fuel[fuel].qty === 0) {
              this.validEntryForms[fuel] = true;
              this.validTotals[fuel] = true;
            }
          });
        } else {
          this.order = Object.assign({}, emptyorder);
        }
      });

    this.subscriptions.set(`order`, ordersubscription);
  }

  toggleTotalsvalidity(fueltype: FuelType, value: boolean) {
    this.validTotals[fueltype] = value;
    let temp = true;

    this.fueltypesArray.forEach(fuel => {
      if (!this.validTotals[fuel]) {
        temp = false;
      }
    });
    this.validAllTotals = temp;
  }

  toggleFormValidity(fueltype: FuelType, value: boolean) {
    this.validEntryForms[fueltype] = value;
    let temp = true;

    this.fueltypesArray.forEach(fuel => {
      if (!this.validEntryForms[fuel]) {
        temp = false;
      }
    });
    this.validAllForms = temp;
  }
  ngOnInit() {

  }
  saveEntryChanges() {
    this.saving = true;
    const batchaction = this.db.firestore.batch();
    let batchesNumberError = false;
    const temporder = deepCopy(this.order);

    const tempStock = this.stock;
    FuelNamesArray.forEach(fuel => {
      /**
       * Only allow a max of 2 entries per truck
       */
      if (this.selectedEntries[fuel].length > 2) {
        batchesNumberError = true;
      }
      /**
       * Update stock quantities
       */
      tempStock.qty[fuel].ase -= this.order.fuel[fuel].qty;
      /**
       * Update entries
       */
      this.selectedEntries[fuel].forEach((entry, index) => {
        const tempEntry: Entry = deepCopy(entry);
        tempEntry.qty.directLoad.total += entry.qtyDrawn;
        tempEntry.qty.used += entry.qtyDrawn;
        tempEntry.active = entry.resultStatus;

        temporder.fuel[fuel].entries[index] = {
          id: entry.Id,
          name: entry.entry.name,
          observed: 0,
          qty: entry.qtyDrawn
        };
        temporder.stage = 4;
        temporder.truck.stage = 1;
        temporder.truckStageData[1] = {
          expiry: [{
            expiry: moment().add(45, "minutes").toDate(),
            timeCreated: moment().toDate(),
            user: this.adminservice.createUserObject()
          }],
          Additions: 0,
          totalApproxTime: 0,
          totalExpiredTime: 0,
          user: this.adminservice.createUserObject()
        };
        /**
         * Update the relevant entries
         */

        batchaction.update(this.entriesService.entryCollection(this.core.currentOmc.value.Id)
          .doc(tempEntry.Id), tempEntry);

      });
    });
    if (batchesNumberError) {
      this.notification.notify({
        alert_type: "error",
        title: "Max Reached",
        body: `A maximum of 2 entries per per fuel truck`
      });
      return;
    } else {
      /**
       * Update the order
       */
      batchaction.update(this.ordersservice.ordersCollection(this.core.currentOmc.value.Id).doc(this.orderId), temporder);
      /**
       * Update stock quantities
       */
      batchaction.update(this.stockService.stockDoc(this.core.currentOmc.value.Id,
        this.core.activedepot.value.depot.Id,
        this.core.activedepot.value.depot.config.private), tempStock);

      batchaction.commit().then(() => {
        this.notification.notify({
          alert_type: "success",
          title: "Success",
          body: `Truck Approved`
        });
        this.dialogRef.close();
      });
    }
  }

}
