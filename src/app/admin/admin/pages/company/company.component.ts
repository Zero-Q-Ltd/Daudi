import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommunicationService } from "../../communication.service";
import { MatDialog } from "@angular/material";
import { ConfigService } from "../../../services/core/config.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { emptyomc } from "../../../../models/omc/Config";
import { OMC } from "../../../../models/omc/OMC";
import { FormArray, FormControl, FormGroup, FormBuilder } from "ngx-strongly-typed-forms";

import { NotificationService } from "../../../../shared/services/notification.service";
import * as firebase from "firebase";
import { NewAdminType, AdminType } from "../../../../models/admin/AdminType";
import { Validators } from "@angular/forms";
import { AdminLevel } from "../../../../models/admin/AdminLevel";
import { Meta } from "../../../../models/universal/Meta";
import { Metadata } from "../../../../models/universal/Metadata";
import { AdminsService } from "../../../services/core/admins.service";
import { ConfirmDialogComponent } from "../../../confirm-dialog/confirm-dialog.component";
@Component({
  selector: "app-company",
  templateUrl: "./company.component.html",
  styleUrls: ["./company.component.scss"]
})
export class CompanyComponent implements OnInit, OnDestroy {
  /**
   * the payment channels that require collection of transaction details
   */
  // customizablepaymentchannels: Array<PaymentChannel>;
  // confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  defaultlat = -1.3373943;
  defaultlng = 36.7208522;
  zoom = 15;
  tempcompany: OMC = { ...emptyomc };
  originalCompany: OMC = { ...emptyomc };
  // paymentchannels: Array<PaymentChannel> = [];
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();


  constructor(
    private notificationservice: NotificationService,
    private adminService: AdminsService,
    private communicatioservice: CommunicationService,
    private companyservice: ConfigService,
    private _matDialog: MatDialog) {

    /**
     * because this component is ot using reactive forms which is not neccessary, subscribe to tab changes and reset the values so
     * that unsaved changes are ignored and the view is reset to the old values
     */
    communicatioservice.tabchanges.subscribe(tab => {
      if (tab === 3) {
      }
    });
    this.initvalues();

  }


  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }
  initvalues(): void {
    this.companyservice.companydata.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
      console.log(co);
      this.originalCompany = co;
      this.tempcompany = Object.assign({}, co);
    });
  }

  mapClicked($event: MouseEvent): void {
    // @ts-ignore
    this.tempcompany.location = new firebase.firestore.GeoPoint($event.coords.lat, $event.coords.lng);
  }

  ngOnInit(): void {

  }

  changestosave(): boolean {
    return JSON.stringify(this.tempcompany) === JSON.stringify(this.originalCompany);
  }

  savecompany(): void {
    console.log(this.tempcompany);
    const dialogRef = this._matDialog.open(ConfirmDialogComponent,

      {
        role: "dialog",
        data: `Are you sure?`
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        this.companyservice.savecompany(this.tempcompany).then(() => {
          this.notificationservice.notify({
            title: "SAVED",
            body: ""
          });
        });
      }
    });
  }
}
