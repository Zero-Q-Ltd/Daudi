import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material";
import { BatchTrucksComponent } from "../batch-trucks/batch-trucks.component";
import { FormControl, Validators } from "@angular/forms";
import { Depot_ } from "../../models/Depot";
import { AdminsService } from "../services/admins.service";
import { DepotsService } from "../services/depots.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";


@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"]
})


export class AdminComponent implements OnInit, OnDestroy {

  position = "above";
  phoneControl: FormControl = new FormControl({ value: "" }, [Validators.required, Validators.maxLength(8), Validators.minLength(8)]);

  alldepots: Array<Depot_>;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private adminservice: AdminsService,
    private dialog: MatDialog,
    private depotsservice: DepotsService) {

    this.depotsservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depots => {
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
        batchkey: batchkey,
        batchdId: batchdId
      },
      height: "auto"
      // width: '100%%',

    });

  }

}
