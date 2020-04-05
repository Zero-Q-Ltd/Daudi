import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFireFunctions } from "@angular/fire/functions";
import { MatDialog } from "@angular/material/dialog";
import { MapsComponent } from "app/components/maps/maps.component";
import { CoreService } from "app/services/core/core.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { SyncRequest } from "../../../../models/Cloud/Sync";
import { Depot, emptydepot } from "../../../../models/Daudi/depot/Depot";
import { emptyomc, OMC } from "../../../../models/Daudi/omc/OMC";
import { MyTimestamp } from "../../../../models/firestore/firestoreTypes";
import { NotificationService } from "../../../../shared/services/notification.service";

@Component({
  selector: "depot-management",
  templateUrl: "./depot-management.component.html",
  styleUrls: ["./depot-management.component.scss"]
})
export class DepotManagementComponent implements OnInit, OnDestroy {
  activedepot: Depot;
  alldepots: Depot[];
  // initial center position for the map
  // 0.401358, 37.906007
  lat = 0;
  lng = 38;
  zoom = 7;
  creatingsync = false;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  company: OMC = { ...emptyomc };

  constructor(
    private notification: NotificationService,
    private dialog: MatDialog,
    private core: CoreService,
    private functions: AngularFireFunctions) {
    this.core.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depot => {
      this.activedepot = depot.depot;
    });
    this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(alldepots => {
      this.alldepots = alldepots;
    });
    this.core.adminConfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
      // this.company = co;
    });
  }

  clickeddepot(event) {
    console.log(event);
    this.lat = event.location._lat;
    this.lng = event.location._long;
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  resetlocation() {
    emptydepot.Location = null;
  }

  savelocation(coursetype, finetype, course, fine) {

  }

  syncdb() {
    if (this.creatingsync) {
      return;
    }

    this.creatingsync = true;
    const syncobject: SyncRequest = {
      time: MyTimestamp.now(),
      synctype: ["Item"]
    };

    this.functions.httpsCallable("requestsync")(syncobject).pipe(takeUntil(this.comopnentDestroyed)).subscribe(res => {
      this.creatingsync = false;
      this.notification.notify({
        alert_type: "success",
        title: "Success",
        body: "Depots Synchronized"
      });
    });

  }

  openmaps() {
    const dialogRef = this.dialog.open(MapsComponent,
      {
        data: this.activedepot
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result !== false) {
        console.log(result);
        emptydepot.Location = result.location;
      }
    });
  }

}
