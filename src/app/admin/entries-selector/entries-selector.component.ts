import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import * as moment from "moment";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Entry } from "../../models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { Config } from "../../models/Daudi/omc/Config";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { Stage1Model } from "../../models/Daudi/order/TruckStages";
import { MyTimestamp } from "../../models/firestore/firestoreTypes";
import { NotificationService } from "../../shared/services/notification.service";
import { AdminService } from "../services/core/admin.service";
import { CoreService } from "../services/core/core.service";
import { OrdersService } from "../services/orders.service";


interface EntryContent {
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
  displayedColumns: string[] = ["id", "batch", "totalqty", "accumulated", "loadedqty", "availableqty", "drawnqty", "remainingqty", "status"];

  drawnEntry: {
    [key in FuelType]: EntryContent[]
  } = {
      pms: [],
      ago: [],
      ik: [],
    };
  fuelerror: {
    [key in FuelType]: { status: boolean, errorString: string }
  };
  saving = false;
  order: Order = { ...emptyorder };
  donecalculating = false;
  fueltypesArray = FuelNamesArray;
  fetchingEntries: boolean;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  config: Config;
  constructor(
    public dialogRef: MatDialogRef<EntriesSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private orderid: string,
    private notification: NotificationService,
    private db: AngularFirestore,
    private adminservice: AdminService,
    private core: CoreService,
    private ordersservice: OrdersService) {
    this.fueltypesArray.forEach((fueltype: FuelType) => {
      this.core.depotEntries[fueltype]
        .pipe(takeUntil(this.comopnentDestroyed))
        .subscribe((entries: Array<Entry>) => {
          console.log(entries);
          this.depotEntries[fueltype] = entries;
          this.calculateqty();
        });
    });
    this.core.loaders.entries.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      this.fetchingEntries = value;
    });
    this.core.config.pipe(takeUntil(this.comopnentDestroyed)).subscribe(config => {
      this.config = config;
    });
    const ordersubscription = this.ordersservice.getOrder(orderid, core.currentOmc.value.Id)
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
      this.fuelerror[fueltype].status = false;
      /**
       * check if there is enough ASE for that fuel
       */
      if (this.config.qty[fueltype].ase >= this.order.fuel[fueltype].qty) {

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
              name: this.depotEntries[fueltype][0].entry.name,
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
                this.fuelerror[fueltype] = {
                  errorString: `Insufficient ENTRY ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
                  status: true
                };
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
                    this.fuelerror[fueltype].status = false;
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
                    this.fuelerror[fueltype] = {
                      errorString: `Insufficient ENTRY ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
                      status: true
                    };
                  }
                }
              }
            });
            if (!batch1) {
              this.fuelerror[fueltype] = {
                errorString: `Insufficient ENTRY ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
                status: true
              };
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
            this.fuelerror[fueltype] = {
              errorString: `Insufficient ENTRY ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
              status: true
            };;
          }
        }
      } else {
        this.donecalculating = true;
        if (this.order.fuel[fueltype].qty > 0 && this.depotEntries[fueltype].length === 0) {
          this.fuelerror[fueltype] = {
            errorString: `Insufficient ASE ${fueltype.toUpperCase()}.Expected amount is ${this.order.fuel[fueltype].qty}`,
            status: true
          };;
        }
      }

      // console.log(this.drawnbatch)

    });
  }
  /**
   * Returns the total available fuel within an entry
   * We used the index because it is the crucial element when working with rollovers
   * @param index of the Entry within the depot entries array
   * @param fueltype fueltype of the ASE
   */
  getTotalAvailableEntry(index: number, fueltype: FuelType) {
    const totalqty = this.depotEntries[fueltype][index].qty.total;
    const loadedqty = this.depotEntries[fueltype][index].qty.directLoad.total + this.depotEntries[fueltype][index].qty.transferred.total;
    return totalqty - loadedqty;
  }
  /**
   * Returns the total available fuel within an ASE
   * We used the index because it is the crucial element when working with rollovers
   * @param index of the Entry within the depot entries array
   * @param fueltype fueltype of the ASE
   */

  /***
   *
   */
  approvetruck() {
    this.saving = true;
    this.dialogRef.disableClose = true;
    this.fueltypesArray.forEach((fueltype: FuelType) => {
      if (this.fuelerror[fueltype].status) {
        this.saving = false;
        this.dialogRef.disableClose = false;
        return this.notification.notify({
          alert_type: "error",
          title: `Error`,
          body: this.fuelerror[fueltype].errorString,
          duration: 6000
        });
      } else {
        this.order.fuel[fueltype].entries[0] = {
          Id: this.drawnEntry[fueltype][0].id,
          qty: this.drawnEntry[fueltype][0].qtydrawn,
          Name: this.drawnEntry[fueltype][0].name,
          observed: 0
        };

        this.order.fuel[fueltype].entries[1] = {
          Id: this.drawnEntry[fueltype][1].id,
          qty: this.drawnEntry[fueltype][1].qtydrawn,
          Name: this.drawnEntry[fueltype][1].name,
          observed: 0
        };
      }
    });
    /**
     * I know that this seems like repetition but calling return above does not complete the function execution so I have to check
     * .... again
     */
    if (!this.fuelerror.pms && !this.fuelerror.ago && !this.fuelerror.ik) {
      const data: Stage1Model = {
        user: this.adminservice.createuserobject(),
        expiry: [
          {
            timeCreated: MyTimestamp.now(),
            expiry: MyTimestamp.fromDate(moment().add(45, "minutes").toDate()),
          }],
        print: {
          status: false,
          timestamp: MyTimestamp.now()
        }
      };
      this.order.stage = 4;
      this.order.loaded = true;

      this.order.stagedata["4"].user = data.user;

      this.order.truck.stagedata["1"] = data;
      this.order.stage = 1;

      const batchaction = this.db.firestore.batch();
      // batchaction.update(this.ordersservice.updateorder(this.orderid, this.order);
      // this.fueltypesArray.forEach((fueltype: FuelType) => {
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
      //       batchaction.update(this.batchesservice.updatebatch(this.order.fuel[fueltype].batches[0].Id), batch1value);
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
      //       batchaction.update(this.batchesservice.updatebatch(this.order.fuel[fueltype].batches[0].Id),
      //         {
      //           loadedqty: this.depotbatches[fueltype][0].loadedqty + this.order.fuel[fueltype].batches[0].qty,
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
