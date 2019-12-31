import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { BatchTrucksComponent } from "../batch-trucks/batch-trucks.component";
import { FormControl, Validators } from "@angular/forms";
import { Depot } from "../../models/Daudi/depot/Depot";
import { AdminService } from "../services/core/admin.service";
import { DepotService } from "../services/core/depot.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CoreService } from "../services/core/core.service";


@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})


export class AdminComponent implements OnInit, OnDestroy {

  position = "above";
  phoneControl: FormControl = new FormControl({ value: "" }, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]);

  alldepots: Array<Depot>;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private adminservice: AdminService,
    private dialog: MatDialog,
    private core: CoreService,
    private depotsservice: DepotService) {

    this.core.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
      this.alldepots = depots;
    });
  }

  isauthenticated(level) {
    if (this.adminservice.userdata.config.level <= level) {
      return true;
      // console.log('authenticated')
    } else {
      return false;
    }
  }


  ngOnInit() {

  }


  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }


  openBatchTrucks(batchkey, batchdId) {
    // console.log(batchkey, batchdId);
    const dialogRef = this.dialog.open(BatchTrucksComponent, {
      role: "dialog",
      data: {
        batchkey,
        batchdId
      },
      height: "auto"
      // width: '100%%',

    });

  }

}
