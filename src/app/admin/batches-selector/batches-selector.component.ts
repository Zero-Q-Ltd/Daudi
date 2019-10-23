import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material";
import { NotificationService } from "../../shared/services/notification.service";
import * as moment from "moment";
import { AngularFirestore } from "@angular/fire/firestore";
import { Batch_ } from "../../models/Batch";
import { emptytruck, Truck } from "../../models/Truck";
import { fuelTypes } from "../../models/universal";
import { emptyorder, Order } from "../../models/Order";
import { AdminsService } from "../services/admins.service";
import { fueltypesArray } from "../../models/Fueltypes";
import { DepotsService } from "../services/depots.service";
import { BatchesService } from "../services/batches.service";
import { TrucksService } from "../services/trucks.service";
import { OrdersService } from "../services/orders.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

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
  selector: "app-batches-selector",
  templateUrl: "./batches-selector.component.html",
  styleUrls: ["./batches-selector.component.scss"]
})


export class BatchesSelectorComponent implements OnInit, OnDestroy {
  depotbatches: {
    pms: Array<Batch_>,
    ago: Array<Batch_>,
    ik: Array<Batch_>
  } = {
      pms: [],
      ago: [],
      ik: []
    };
  truck: Truck = Object.assign({}, emptytruck);
  displayedColumns: string[] = ["id", "batch", "totalqty", "accumulated", "loadedqty", "availableqty", "drawnqty", "remainingqty", "status"];
  batches: {
    pms: Array<Batch_>
    ago: Array<Batch_>
    ik: Array<Batch_>
  } = {
      pms: [],
      ago: [],
      ik: []
    };
  drawnbatch: {
    [key in fuelTypes]: {
      batch0: batchContent,
      batch1: batchContent
    }
  } = {
      pms: {
        batch0: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        },
        batch1: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        }
      },
      ago: {
        batch0: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        },
        batch1: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        }
      },
      ik: {
        batch0: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        },
        batch1: {
          id: null,
          qtydrawn: 0,
          name: null,
          totalqty: 0,
          resultstatus: null,
          remainqty: 0
        }
      }
    };
  fuelerror = {
    pms: false,
    ago: false,
    ik: false
  };
  saving = false;
  order: Order = Object.assign({}, emptyorder);
  donecalculating = false;
  fueltypesArray = fueltypesArray;
  fetchingbatches: boolean;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();

  constructor(public dialogRef: MatDialogRef<BatchesSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) private truckid: string,
    private notification: NotificationService,
    private db: AngularFirestore,
    private adminservice: AdminsService,
    private depotsservice: DepotsService,
    private batchesservice: BatchesService,
    private trucksservice: TrucksService,
    private ordersservice: OrdersService) {
    fueltypesArray.forEach((fueltype: fuelTypes) => {
      this.batchesservice.depotbatches[fueltype].pipe(takeUntil(this.comopnentDestroyed)).subscribe((batches: Array<Batch_>) => {
        // console.log(batches);
        this.depotbatches[fueltype] = batches;
        this.batches[fueltype] = batches;
        this.calculateqty();
      });
    });
    this.batchesservice.fetchingbatches.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      this.fetchingbatches = value;
    });
    const subscription = this.trucksservice.getTruck(truckid)
      .onSnapshot(trucksnapshot => {
        if (trucksnapshot.exists) {
          this.truck = Object.assign({}, trucksnapshot.data()) as Truck;
          this.truck.Id = trucksnapshot.id;
          const ordersubscription = this.ordersservice.getorder(this.truck.orderdata.OrderID)
            .onSnapshot(ordersnapshot => {
              if (trucksnapshot.exists) {
                this.order = Object.assign({}, ordersnapshot.data()) as Order;
                this.order.Id = ordersnapshot.id;
              } else {
                this.order = Object.assign({}, emptyorder);
              }
            });
          this.subscriptions.set(`originalorder`, subscription);
        } else {
          this.truck = Object.assign({}, emptytruck);
        }
        this.calculateqty();
      });
    this.subscriptions.set(`clickedtruck`, subscription);

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
    fueltypesArray.forEach((fueltype: fuelTypes) => {
      this.fuelerror[fueltype] = false;
      /**
       * Check if there are batches to assign
       */
      if ((this.depotbatches[fueltype].length > 0) && (this.truck.fuel[fueltype].qty > 0)) {
        /**
         * Check if there is a rollover in the batches
         */
        if (this.getTotalAvailable(0, fueltype) >= this.truck.fuel[fueltype].qty) {
          this.drawnbatch[fueltype] = {
            batch0: {
              id: this.depotbatches[fueltype][0].Id,
              /**
               * Since there is only 1 batch to be assigned, the new qty is direct
               */
              qtydrawn: this.truck.fuel[fueltype].qty,
              name: this.depotbatches[fueltype][0].batch,
              totalqty: this.depotbatches[fueltype][0].qty,
              resultstatus: this.getTotalAvailable(0, fueltype) > this.truck.fuel[fueltype].qty,
              remainqty: this.getTotalAvailable(0, fueltype) - this.truck.fuel[fueltype].qty
            },
            batch1: {
              id: null,
              qtydrawn: 0,
              name: null,
              totalqty: 0,
              resultstatus: true,
              remainqty: 0
            }
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
          const assignedamount = this.getTotalAvailable(0, fueltype);

          this.depotbatches[fueltype].forEach((batch: Batch_, index) => {
            /**
             * Check if there is fuel to rollover
             */
            if (this.depotbatches[fueltype].length < 2) {
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
              if (this.getTotalAvailable(index, fueltype) >= (this.truck.fuel[fueltype].qty - assignedamount)) {
                /**
                 * Only assign a batch if not already containing a value, hence have affinity for the order of display as the second assigned batch
                 */
                if (!batch1.id) {
                  /**
                   * remove the error in case it was caused by a batch within the loop not being enough
                   * If all the batches are not enough it will remain true
                   */
                  this.fuelerror[fueltype] = false;
                  const qtydrawn = this.truck.fuel[fueltype].qty - assignedamount;
                  batch1 = {
                    id: batch.Id,
                    qtydrawn,
                    name: batch.batch,
                    totalqty: batch.qty,
                    resultstatus: this.getTotalAvailable(index, fueltype) > assignedamount,
                    remainqty: this.getTotalAvailable(index, fueltype) - qtydrawn
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
          this.drawnbatch[fueltype] = {
            batch0: {
              id: this.depotbatches[fueltype][0].Id,
              /**
               * the qty drown
               */
              qtydrawn: this.getTotalAvailable(0, fueltype),
              name: this.depotbatches[fueltype][0].batch,
              totalqty: this.depotbatches[fueltype][0].qty,
              resultstatus: false,
              remainqty: 0
            },
            batch1
          };
          this.donecalculating = true;

        }
      } else {
        this.donecalculating = true;
        if (this.truck.fuel[fueltype].qty > 0 && this.depotbatches[fueltype].length === 0) {
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

  getTotalAvailable(index: number, fueltype: fuelTypes) {
    const totalqty = this.depotbatches[fueltype][index].qty;
    const loadedqty = this.depotbatches[fueltype][index].loadedqty;
    const accumulated = this.depotbatches[fueltype][index].accumulated;
    return totalqty - loadedqty + accumulated.usable;
  }

  /***
   *
   */
  approvetruck() {
    this.saving = true;
    this.dialogRef.disableClose = true;
    fueltypesArray.forEach((fueltype: fuelTypes) => {
      if (this.fuelerror[fueltype]) {
        this.saving = false;
        this.dialogRef.disableClose = false;
        return this.notification.notify({
          alert_type: "error",
          title: `Error`,
          body: `Insufficient ${fueltype.toUpperCase()}.Expected amount is ${this.truck.fuel[fueltype].qty}`,
          duration: 6000
        });
      } else {
        this.truck.fuel[fueltype].batches["0"].Name = this.drawnbatch[fueltype].batch0.name;
        this.truck.fuel[fueltype].batches["0"].Id = this.drawnbatch[fueltype].batch0.id;
        this.truck.fuel[fueltype].batches["0"].qty = this.drawnbatch[fueltype].batch0.qtydrawn;
        this.truck.fuel[fueltype].batches["0"].observed = 0;

        this.truck.fuel[fueltype].batches["1"].Name = this.drawnbatch[fueltype].batch1.name;
        this.truck.fuel[fueltype].batches["1"].Id = this.drawnbatch[fueltype].batch1.id;
        this.truck.fuel[fueltype].batches["1"].qty = this.drawnbatch[fueltype].batch1.qtydrawn;
        this.truck.fuel[fueltype].batches["1"].observed = 0;
      }
    });
    /**
     * I know that this seems like repetition but calling return above does not complete the function execution so I have to check
     * .... again
     */
    if (!this.fuelerror.pms && !this.fuelerror.ago && !this.fuelerror.ik) {
      const data = {
        expiry: [{ time: "00:45:00", timestamp: moment().add(45, "minutes").toDate() }]
      };
      this.order.stage = 4;
      this.order.stagedata["4"] = {} as any;
      this.order.stagedata["4"].user = this.adminservice.createuserobject();
      this.order.loaded = true;

      this.truck.truckId = this.order.InvoiceId;
      this.truck.stagedata["1"].data = data;
      this.truck.stagedata["1"].user = this.adminservice.createuserobject();
      this.truck.stage = 1;
      this.truck.isPrinted = false;

      const batchaction = this.db.firestore.batch();
      batchaction.update(this.trucksservice.updatetruck(this.truckid), this.truck);
      batchaction.update(this.ordersservice.updateorder(this.truck.orderdata.OrderID), this.order);
      fueltypesArray.forEach((fueltype: fuelTypes) => {
        /**
         * check if the truck contained that fueltype
         */
        if (this.truck.fuel[fueltype].qty > 0) {
          /**
           * check if two batch numbers have been assigned to the truck for that fueltype
           */
          if (this.truck.fuel[fueltype].batches["1"].qty > 0) {
            /**
             * Update the batch number quantity and disable the batch
             * A max of 2 batch numbers may be assigned to the truck
             */
            const batch1value = {
              loadedqty: this.depotbatches[fueltype][0].qty,
              accumulated: {
                usable: 0,
                total: this.depotbatches[fueltype][0].accumulated.total
              },
              status: 0
            };
            batchaction.update(this.batchesservice.updatebatch(this.truck.fuel[fueltype].batches["0"].Id), batch1value);
            /**
             * Leave the second batch number active if neccessary
             */
            const batch2value = {
              loadedqty: this.drawnbatch[fueltype].batch1.totalqty - this.drawnbatch[fueltype].batch1.remainqty,
              status: this.drawnbatch[fueltype].batch1.resultstatus ? 1 : 0
            };
            batchaction.update(this.batchesservice.updatebatch(this.truck.fuel[fueltype].batches["1"].Id), batch2value);
          } else {
            /**
             * Only one batch number assigned, hence leave it active
             */
            batchaction.update(this.batchesservice.updatebatch(this.truck.fuel[fueltype].batches["0"].Id),
              {
                loadedqty: this.depotbatches[fueltype][0].loadedqty + this.truck.fuel[fueltype].batches["0"].qty,
                accumulated: {
                  usable: 0,
                  total: this.depotbatches[fueltype][0].accumulated.total
                },
                status: this.drawnbatch[fueltype].batch0.resultstatus ? 1 : 0

              });
          }
        }
      });
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
