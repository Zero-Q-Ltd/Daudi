import { Component, OnInit, ViewChild } from "@angular/core";
import { fueltypesArray } from "../../../../models/Fueltypes";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { Batch, emptybatches } from "../../../../models/Batch";
import { fuelTypes } from "../../../../models/universal";
import { DepotsService } from "../../../services/depots.service";
import { BatchesService } from "../../../services/batches.service";
import { syncrequest } from "../../../../models/Sync";
import { firestore } from "firebase";
import { NotificationService } from "../../../../shared/services/notification.service";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-batches",
  templateUrl: "./batches.component.html",
  styleUrls: ["./batches.component.scss"]
})
export class BatchesComponent implements OnInit {
  fueltypesArray = fueltypesArray;
  datasource = {
    pms: new MatTableDataSource<Batch>(),
    ago: new MatTableDataSource<Batch>(),
    ik: new MatTableDataSource<Batch>()
  };
  creatingsync = false;
  @ViewChild(MatPaginator, { static: true }) pmspaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) agopaginator: MatPaginator;
  @ViewChild(MatPaginator, { static: true }) ikpaginator: MatPaginator;
  displayedColumns: string[] = ["id", "date", "batch", "totalqty", "accumulated", "usableaccumulated", "loadedqty", "availableqty", "status"];
  loading: {
    pms: boolean,
    ago: boolean,
    ik: boolean
  } = {
      pms: true,
      ago: true,
      ik: true
    };
  availablefuel: {
    pms: number,
    ago: number,
    ik: number
  } = {
      pms: 0,
      ago: 0,
      ik: 0
    };

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private depotsservice: DepotsService,
    private notification: NotificationService,
    private functions: AngularFireFunctions,
    private batcheservice: BatchesService,
    private batchesservice: BatchesService) {
    depotsservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotvata => {
      this.loading = {
        pms: true,
        ago: true,
        ik: true
      };

      if (depotvata.Id) {
        fueltypesArray.forEach((fueltype: fuelTypes) => {
          /**
           * Create a subscrition for 1000 batches history
           */
          const subscription = this.batchesservice.getbatches(fueltype).limit(100)
            .onSnapshot(snapshot => {
              this.loading[fueltype] = false;
              this.datasource[fueltype].data = snapshot.docs.map(batch => {
                const value: Batch = Object.assign({}, emptybatches, batch.data());
                value.Id = batch.id;
                return value;
              });
            });
          this.subscriptions.set(`batches`, subscription);

          /**
           * Because all these batches might take time to load, take the totals
           * from the already loaded batches within that depot
           */
          this.batcheservice.depotbatches[fueltype]
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe((batches: Array<Batch>) => {
              /**
               * Reset the values every time batches change
               */
              this.availablefuel[fueltype] = 0;
              batches.forEach(batch => {
                this.availablefuel[fueltype] += this.getTotalAvailable(batch);
              });
            });
        });
      }
    });
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

  syncdb() {
    this.creatingsync = true;
    const syncobject: syncrequest = {
      companyid: this.depotsservice.activedepot.value.companyId,
      time: firestore.Timestamp.now(),
      synctype: ["BillPayment"]
    };

    this.functions.httpsCallable("requestsync")(syncobject).subscribe(res => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "success",
        body: "Batches updated",
        title: "Success"
      });
    });

  }

  getTotalAvailable(batch: Batch) {
    const totalqty = batch.qty;
    const loadedqty = batch.loadedqty;
    const accumulated = batch.accumulated;
    return totalqty - loadedqty + accumulated.usable;
  }

  ngOnInit() {
    this.datasource.pms.paginator = this.pmspaginator;
    this.datasource.ago.paginator = this.agopaginator;
    this.datasource.ik.paginator = this.ikpaginator;
  }

  filterbatches(fueltype: string, filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.datasource[fueltype].filter = filterValue;
  }
}
