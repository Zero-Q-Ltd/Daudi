import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { Depot, emptydepot } from "../../../../models/depot/Depot";
import { NotificationService } from "../../../../shared/services/notification.service";
import { AdminService } from "../../../services/core/admin.service";
import { DepotService } from "../../../services/core/depot.service";
import { SyncRequest } from "../../../../models/qbo/sync/Sync";
import { firestore } from "firebase";
import { MapsComponent } from "../../../maps/maps.component";
import { AngularFireFunctions } from "@angular/fire/functions";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { emptyomc } from "../../../../models/omc/Configg";
import { OMC } from "../../../../models/omc/OMC";
import { ConfigService } from "../../../services/core/config.service";

@Component({
  selector: "depot-management",
  templateUrl: "./depot-management.component.html",
  styleUrls: ["./depot-management.component.scss"]
})
export class DepotManagementComponent implements OnInit, OnDestroy {
  activedepot: Depot;
  alldepots: Array<Depot>;
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
    private adminservice: AdminService,
    private depotservice: DepotService,
    private companyservice: ConfigService,
    private config: ConfigService,
    private functions: AngularFireFunctions) {
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depot => {
      this.activedepot = depot;
    });
    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(alldepots => {
      this.alldepots = alldepots;
    });
    this.companyservice.omcconfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
      this.company = co;
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
      companyid: this.config.omcconfig.value.Qbo.companyId,
      time: firestore.Timestamp.now(),
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
