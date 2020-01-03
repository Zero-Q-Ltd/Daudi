import { Component, OnInit, ViewChild } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatPaginator, MatTableDataSource } from "@angular/material";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CompanySync } from "../../../../models/Cloud/CompanySync";
import { SyncRequest } from "../../../../models/Cloud/Sync";
import { emptyEntry, Entry } from "../../../../models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "../../../../models/Daudi/fuel/FuelType";
import { MyTimestamp } from "../../../../models/firestore/firestoreTypes";
import { NotificationService } from "../../../../shared/services/notification.service";
import { CoreService } from "../../../services/core/core.service";
import { EntriesService } from "../../../services/entries.service";


@Component({
  selector: "app-entries",
  templateUrl: "./entries.component.html",
  styleUrls: ["./entries.component.scss"]
})
export class EntriesComponent implements OnInit {
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
  displayedColumns: string[] = ["id", "date", "entry", "totalqty", "transferred", "loadedqty", "availableqty", "status"];
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
    private notification: NotificationService,
    private functions: AngularFireFunctions,
    private core: CoreService,
    private entriesService: EntriesService) {
    this.core.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depotvata => {
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
          const subscription = this.entriesService.entryCollection(this.core.currentOmc.value.Id)
            .where("fuelType", "==", fueltype)
            .limit(100)
            .onSnapshot(snapshot => {
              this.loading[fueltype] = false;
              this.datasource[fueltype].data = snapshot.docs.map(entry => {
                const value: Entry = Object.assign({}, emptyEntry, entry.data());
                value.Id = entry.id;
                return value;
              });
            });
          this.subscriptions.set(`batches`, subscription);
          /**
           * Because all these batches might take time to load, take the totals
           * from the already loaded batches within that depot
           */
          this.core.depotEntries[fueltype]
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

    const req: SyncRequest = {
      time: MyTimestamp.now(),
      synctype: ["BillPayment"]
    };

    const syncobject: CompanySync = {
      config: this.core.config.value,
      environment: this.core.environment.value,
      omc: this.core.currentOmc.value,
      sync: req
    };

    this.functions.httpsCallable("requestsync")(syncobject).subscribe(res => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "success",
        body: "Entries updated",
        title: "Success"
      });
    });
  }

  getTotalAvailable(batch: Entry) {
    const totalqty = batch.qty.total;
    const totalLoaded = batch.qty.directLoad.total + batch.qty.transferred.total;
    return totalqty - totalLoaded;
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
