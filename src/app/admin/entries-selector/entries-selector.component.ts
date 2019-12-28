import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { NotificationService } from "../../shared/services/notification.service";
import * as moment from "moment";
import { AngularFirestore } from "@angular/fire/firestore";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { emptytruck, Truck, StageData } from "../../models/Daudi/order/Truck";
import { FuelType, FuelNamesArray, } from "../../models/Daudi/fuel/FuelType";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { AdminService } from "../services/core/admin.service";
import { DepotService } from "../services/core/depot.service";
import { EntriesService } from "../services/entries.service";
import { OrdersService } from "../services/orders.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { MyTimestamp } from "../../models/firestore/firestoreTypes";
import { ASE } from "../../models/Daudi/fuel/ASE";


interface batchContent {
  id: string;
  qtydrawn: number;
  name: string;
  totalqty: number;
  /**
   * @description the amount that will remail
   */
  remainqty: number;
  resultstatus: boolean;
}

@Component({
  selector: "app-entries-selector",
  templateUrl: "./entries-selector.component.html",
  styleUrls: ["./entries-selector.component.scss"]
})


export class EntriesSelectorComponent implements OnInit, OnDestroy {
  depotEntries: {
    pms: Array<Entry>,
    ago: Array<Entry>,
    ik: Array<Entry>
  } = {
      pms: [],
      ago: [],
      ik: []
    };
  depotASEs: {
    pms: Array<ASE>,
    ago: Array<ASE>,
    ik: Array<ASE>
  } = {
      pms: [],
      ago: [],
      ik: []
    };
  displayedColumns: string[] = ["id", "batch", "totalqty", "accumulated", "loadedqty", "availableqty", "drawnqty", "remainingqty", "status"];

  drawnEntry: {
    [key in FuelType]: batchContent[]
  } = {
      pms: [],
      ago: [],
      ik: [],
    };
  fuelerror = {
    pms: false,
    ago: false,
    ik: false
  };
  saving = false;
  order: Order = { ...emptyorder };
  donecalculating = false;
  fueltypesArray = FuelNamesArray;
  fetchingbatches: boolean;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(
    public dialogRef: MatDialogRef<EntriesSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private orderid: string,
    private notification: NotificationService,
    private db: AngularFirestore,
    private adminservice: AdminService,
    private depotsService: DepotService,
    private entriesService: EntriesService,
    private ordersservice: OrdersService) {
    this.fueltypesArray.forEach((fueltype: FuelType) => {
      this.entriesService.depotEntries[fueltype]
        .pipe(takeUntil(this.comopnentDestroyed))
        .subscribe((entries: Array<Entry>) => {
          console.log(entries);
          this.depotEntries[fueltype] = entries;
          this.calculateqty();
        });
    });
    this.entriesService.fetchingEntry.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      this.fetchingbatches = value;
    });
    const ordersubscription = this.ordersservice.getorder(orderid)
      .onSnapshot(orderSnapshot => {
        if (orderSnapshot.exists) {
          this.order = Object.assign({}, orderSnapshot.data()) as Order;
          this.order.Id = orderSnapshot.id;
        } else {
          this.order = Object.assign({}, emptyorder);
        }
        this.calculateqty();
      });
    this.subscriptions.set(`order`, ordersubscription);

  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }

  calculateqty() {
    this.donecalculating = false;
    this.fueltypesArray.forEach((fueltype: FuelType) => {
      this.fuelerror[fueltype] = false;
      /**
       * Check if there are batches to assign
       */
      if ((this.depotEntries[fueltype].length > 0) && (this.order.fuel[fueltype].qty > 0)) {
        /**
         * Check if there is a rollover in the batches
         */
        if (this.getTotalAvailableEntry(0, fueltype) >= this.order.fuel[fueltype].qty) {
          this.drawnEntry[fueltype][0] = {
            id: this.depotEntries[fueltype][0].Id,
            /**
             * Since there is only 1 batch to be assigned, the new qty is direct
             */
            qtydrawn: this.order.fuel[fueltype].qty,
            name: this.depotEntries[fueltype][0].entry.id,
            totalqty: this.depotEntries[fueltype][0].qty.total,
            resultstatus: this.getTotalAvailableEntry(0, fueltype) > this.order.fuel[fueltype].qty,
            remainqty: this.getTotalAvailableEntry(0, fueltype) - this.order.fuel[fueltype].qty
          };
          this.donecalculating = true;

        } else {
          /**
           * Loop through all the batches to get the next available batch number that will be able to completely fill the truck
           */
          let batch1 = {
            id: null,
            qtydrawn: 0,
            name: null,
            totalqty: 0,
            resultstatus: true,
            remainqty: 0
          };
          /**
           * The value that should e deducted as a result of assigning the first batch number
           */
          const assignedamount = this.getTotalAvailableEntry(0, fueltype);

          this.depotEntries[fueltype].forEach((batch: Entry, index) => {
            /**
             * Check if there is fuel to rollover
             */
            if (this.depotEntries[fueltype].length < 2) {
              this.fuelerror[fueltype] = true;
              return;
            }
            /**
             * Start at pos 1 because pos 0 MUST be used in batch0
             */
            if (index > 0) {
              /**
               * Check if the batch number at that position has enough fuel to be assigned, otherwise error
               */
              if (this.getTotalAvailableEntry(index, fueltype) >= (this.order.fuel[fueltype].qty - assignedamount)) {
                /**
                 * Only assign a batch if not already containing a value, hence have affinity for the order of display as the second assigned batch
                 */
                if (!batch1.id) {
                  /**
                   * remove the error in case it was caused by a batch within the loop not being enough
                   * If all the batches are not enough it will remain true
                   */
                  this.fuelerror[fueltype] = false;
                  const qtydrawn = this.order.fuel[fueltype].qty - assignedamount;
                  batch1 = {
                    id: batch.Id,
                    qtydrawn,
                    name: batch.entry,
                    totalqty: batch.qty.total,
                    resultstatus: this.getTotalAvailableEntry(index, fueltype) > assignedamount,
                    remainqty: this.getTotalAvailableEntry(index, fueltype) - qtydrawn
                  };
                }
              } else {
                /**
                 * Olny set error if batch 1 doesnt exist
                 */
                if (!batch1.id) {
                  this.fuelerror[fueltype] = true;
                }
              }
            }
          });
          if (!batch1) {
            this.fuelerror[fueltype] = true;
          }
          this.drawnEntry[fueltype] = [{
            id: this.depotEntries[fueltype][0].Id,
            /**
             * the qty drown
             */
            qtydrawn: this.getTotalAvailableEntry(0, fueltype),
            name: this.depotEntries[fueltype][0].entry,
            totalqty: this.depotEntries[fueltype][0].qty.total,
            resultstatus: false,
            remainqty: 0
          }, batch1];
          this.donecalculating = true;

        }
      } else {
        this.donecalculating = true;
        if (this.order.fuel[fueltype].qty > 0 && this.depotEntries[fueltype].length === 0) {
          this.fuelerror[fueltype] = true;
        }
      }
      // console.log(this.drawnbatch)

    });
  }

  resolveindex(index: number) {
    if (index > 1) {
      return 1;
    } else {
      return index;
    }
  }
  /**
   * Returns the total available fuel within an entry
   * We used the index because it is the crucial element when working with rollovers
   * @param index of the Entry within the depot entries array
   * @param fueltype fueltype of the ASE
   */
  getTotalAvailableEntry(index: number, fueltype: FuelType) {
    const totalqty = this.depotEntries[fueltype][index].qty.total;
    const loadedqty = this.depotEntries[fueltype][index].qty.directLoad.total + this.depotEntries[fueltype][index].qty.transfered.total;
    return totalqty - loadedqty;
  }
  /**
   * Returns the total available fuel within an ASE
   * We used the index because it is the crucial element when working with rollovers
   * @param index of the Entry within the depot entries array
   * @param fueltype fueltype of the ASE
   */
  getTotalAvailableASE(index: number, fueltype: FuelType) {
    const totalqty = this.depotASEs[fueltype][index].qty.total;
    const loadedqty = this.depotASEs[fueltype][index].qty.directLoad.total + this.depotASEs[fueltype][index].qty.transfered.total;
    const accumulated = this.depotASEs[fueltype][index].qty.directLoad.accumulated.total;
    return totalqty - loadedqty + accumulated;
  }

  /***
   *
   */
  approvetruck() {
    this.saving = true;
    this.dialogRef.disableClose = true;
    this.fueltypesArray.forEach((fueltype: FuelType) => {
      if (this.fuelerror[fueltype]) {
        this.saving = false;
        this.dialogRef.disableClose = false;
        return this.notification.notify({
          alert_type: "error",
          title: `Error`,
          body: `Insufficient ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
          duration: 6000
        });
      } else {
        this.order.fuel[fueltype].batches["0"].Name = this.drawnEntry[fueltype][0].name;
        this.order.fuel[fueltype].batches["0"].Id = this.drawnEntry[fueltype][0].id;
        this.order.fuel[fueltype].batches["0"].qty = this.drawnEntry[fueltype][0].qtydrawn;
        this.order.fuel[fueltype].batches["0"].observed = 0;

        this.order.fuel[fueltype].batches["1"].Name = this.drawnEntry[fueltype][0].name;
        this.order.fuel[fueltype].batches["1"].Id = this.drawnEntry[fueltype][0].id;
        this.order.fuel[fueltype].batches["1"].qty = this.drawnEntry[fueltype][0].qtydrawn;
        this.order.fuel[fueltype].batches["1"].observed = 0;
      }
    });
    /**
     * I know that this seems like repetition but calling return above does not complete the function execution so I have to check
     * .... again
     */
    if (!this.fuelerror.pms && !this.fuelerror.ago && !this.fuelerror.ik) {
      const data: StageData = {
        user: this.adminservice.createuserobject(),
        expiry: [
          {
            timeCreated: MyTimestamp.now(),
            expiry: MyTimestamp.fromDate(moment().add(45, "minutes").toDate()),
          }],
      };
      this.order.stage = 4;
      this.order.stagedata["4"] = {} as any;
      this.order.stagedata["4"].user = this.adminservice.createuserobject();
      this.order.loaded = true;

      // this.truck.stagedata["1"].expiry = data;
      // this.truck.stagedata["1"].user = this.adminservice.createuserobject();
      // this.truck.stage = 1;

      const batchaction = this.db.firestore.batch();
      // batchaction.update(this.ordersservice.updateorder(this.orderid, this.order);
      // fueltypesArray.forEach((fueltype: fuelTypes) => {
      //   /**
      //    * check if the truck contained that fueltype
      //    */
      //   if (this.order.fuel[fueltype].qty > 0) {
      //     /**
      //      * check if two batch numbers have been assigned to the truck for that fueltype
      //      */
      //     if (this.order.fuel[fueltype].batches["1"].qty > 0) {
      //       /**
      //        * Update the batch number quantity and disable the batch
      //        * A max of 2 batch numbers may be assigned to the truck
      //        */
      //       const batch1value = {
      //         loadedqty: this.depotbatches[fueltype][0].qty,
      //         accumulated: {
      //           usable: 0,
      //           total: this.depotbatches[fueltype][0].accumulated.total
      //         },
      //         status: 0
      //       };
      //       batchaction.update(this.batchesservice.updatebatch(this.order.fuel[fueltype].batches["0"].Id), batch1value);
      //       /**
      //        * Leave the second batch number active if neccessary
      //        */
      //       const batch2value = {
      //         loadedqty: this.drawnbatch[fueltype].batch1.totalqty - this.drawnbatch[fueltype].batch1.remainqty,
      //         status: this.drawnbatch[fueltype].batch1.resultstatus ? 1 : 0
      //       };
      //       batchaction.update(this.batchesservice.updatebatch(this.order.fuel[fueltype].batches["1"].Id), batch2value);
      //     } else {
      //       /**
      //        * Only one batch number assigned, hence leave it active
      //        */
      //       batchaction.update(this.batchesservice.updatebatch(this.order.fuel[fueltype].batches["0"].Id),
      //         {
      //           loadedqty: this.depotbatches[fueltype][0].loadedqty + this.order.fuel[fueltype].batches["0"].qty,
      //           accumulated: {
      //             usable: 0,
      //             total: this.depotbatches[fueltype][0].accumulated.total
      //           },
      //           status: this.drawnbatch[fueltype].batch0.resultstatus ? 1 : 0

      //         });
      //     }
      //   }
      // });
      batchaction.commit().then(value => {
        this.notification.notify({
          alert_type: "success",
          title: "Success",
          body: `Truck Approved`
        });
        this.dialogRef.close();
      });
    }

  }

  ngOnInit() {
  }

}
