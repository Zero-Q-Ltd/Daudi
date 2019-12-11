import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { Entry, emptybatches } from "../../../../models/Daudi/fuel/Entry";
import { DepotService } from "../../../services/core/depot.service";
import { BatchesService } from "../../../services/batches.service";
import { NotificationService } from "../../../../shared/services/notification.service";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ConfigService } from "../../../services/core/config.service";
import { FuelType, FuelNamesArray } from "../../../../models/Daudi/fuel/FuelType";
import { SyncRequest } from "../../../../models/Cloud/Sync";
import { MyTimestamp } from "../../../../models/firestore/firestoreTypes";


@Component({
  selector: "app-entries",
  templateUrl: "./entries.component.html",
  styleUrls: ["./entries.component.scss"]
})
export class BatchesComponent implements OnInit {
  fueltypesArray = FuelNamesArray;
  datasource = {
    pms: new MatTableDataSource<Entry>(),
    ago: new MatTableDataSource<Entry>(),
    ik: new MatTableDataSource<Entry>()
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
    private depotsservice: DepotService,
    private notification: NotificationService,
    private functions: AngularFireFunctions,
    private batcheservice: BatchesService,
    private config: ConfigService,
    private batchesservice: BatchesService) {
    depotsservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotvata => {
      this.loading = {
        pms: true,
        ago: true,
        ik: true
      };

      if (depotvata.depot.Id) {
        this.fueltypesArray.forEach((fueltype: FuelType) => {
          /**
           * Create a subscrition for 1000 batches history
           */
          const subscription = this.batchesservice.getbatches(fueltype).limit(100)
            .onSnapshot(snapshot => {
              this.loading[fueltype] = false;
              this.datasource[fueltype].data = snapshot.docs.map(batch => {
                const value: Entry = Object.assign({}, emptybatches, batch.data());
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
            .subscribe((batches: Array<Entry>) => {
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
    const syncobject: SyncRequest = {
      time: MyTimestamp.now(),
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

  getTotalAvailable(batch: Entry) {
    const totalqty = batch.qty.total;
    const totalLoaded = batch.qty.directLoad.total + batch.qty.transfered;
    const accumulated = batch.qty.directLoad.accumulated;
    return totalqty - totalLoaded + accumulated.usable;
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
