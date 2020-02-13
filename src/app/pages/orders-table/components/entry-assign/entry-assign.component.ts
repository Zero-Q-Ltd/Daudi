import { Component, Inject, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { Entry, EntryDraw } from "app/models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "app/models/Daudi/fuel/FuelType";
import { newStock, Stock } from "app/models/Daudi/omc/Stock";
import { emptyorder, Order } from "app/models/Daudi/order/Order";
import { deepCopy } from "app/models/utils/deepCopy";
import { CoreService } from "app/services/core/core.service";
import { OrdersService } from "app/services/orders.service";
import { NotificationService } from "app/shared/services/notification.service";
import { EntriesService } from 'app/services/entries.service';

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
    private entriesService: EntriesService
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
    FuelNamesArray.forEach(fuel => {
      if (this.selectedEntries[fuel].length > 1) {
        batchesNumberError = true;
      }
      this.selectedEntries[fuel].forEach((entry, index) => {
        const tempEntry: Entry = deepCopy(entry);
        tempEntry.qty.directLoad.total += entry.qtyDrawn;
        tempEntry.qty.used += entry.qtyDrawn;
        tempEntry.active = entry.resultStatus;

        this.order.fuel[fuel].entries[index] = {
          Id: entry.Id,
          Name: entry.entry.name,
          observed: 0,
          qty: entry.qtyDrawn
        };
        this.order.stage = 4
        this.order.truck.stage = 1
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
        body: `A maximum of 2 entries per truck per fuel`
      });
      return;
    } else {
      batchaction.update(this.ordersservice.ordersCollection(this.core.currentOmc.value.Id).doc(this.orderId), this.order);
      batchaction.commit().then(() => {
        this.notification.notify({
          alert_type: "success",
          title: "Success",
          body: `Truck Approved`
        });
        this.dialogRef.close();
      })
    }
  }

}
