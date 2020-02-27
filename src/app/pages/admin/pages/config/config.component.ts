import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from 'app/components/confirm-dialog/confirm-dialog.component';
import { AdminConfigService } from 'app/services/core/admin-config.service';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { emptyomc, OMC } from '../../../../models/Daudi/omc/OMC';
import { deepCopy } from '../../../../models/utils/deepCopy';
import { NotificationService } from '../../../../shared/services/notification.service';
import { CommunicationService } from '../../communication.service';

@Component({
  selector: 'app-company',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.scss']
})
export class ConfigComponent implements OnInit, OnDestroy {
  /**
   * the payment channels that require collection of transaction details
   */
  // customizablepaymentchannels: Array<PaymentChannel>;
  // confirmDialogRef: MatDialogRef<FuseConfirmDialogComponent>;
  defaultlat = -1.3373943;
  defaultlng = 36.7208522;
  zoom = 15;
  tempcompany: OMC = deepCopy<OMC>(emptyomc);
  originalCompany: OMC = deepCopy<OMC>(emptyomc);
  // paymentchannels: Array<PaymentChannel> = [];
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private notificationservice: NotificationService,
    communicatioservice: CommunicationService,
    private companyservice: AdminConfigService,
    private core: CoreService,
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
    this.core.adminConfig.pipe(takeUntil(this.comopnentDestroyed)).subscribe(co => {
      console.log(co);
      // this.originalCompany = co;
      // this.tempcompany = Object.assign({}, co);
    });
  }

  mapClicked($event: MouseEvent): void {
    // @ts-ignore
    this.tempcompany.location = new MyGeoPoint($event.coords.lat, $event.coords.lng);
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
        role: 'dialog',
        data: `Are you sure?`
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        // this.companyservice.saveConfig(null, this.tempcompany).then(() => {
        //   this.notificationservice.notify({
        //     title: "SAVED",
        //     body: ""
        //   });
        // });
      }
    });
  }
}
