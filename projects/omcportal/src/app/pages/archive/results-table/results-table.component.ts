import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { Order } from 'app/models/Daudi/order/Order';
import { MatDialog } from '@angular/material/dialog';
import { SendMsgComponent } from 'app/components/send-msg/send-msg.component';
import { ConfirmDialogComponent } from 'app/components/confirm-dialog/confirm-dialog.component';
import { takeUntil } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';
import { OrdersService } from 'app/services/orders.service';
import { NotificationService } from 'app/shared/services/notification.service';
import { CoreService } from 'app/services/core/core.service';
import { Truck } from 'app/models/Daudi/order/truck/Truck';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsTableComponent implements OnInit {
  @Input() order: Order[]
  ordersdataSource = new MatTableDataSource<Order>(this.order);
  typedValue: string;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  expandedElement = null;
  ordercolumns = [
    "Id",
    "Company",
    "Contact",
    "Time",
    "User",
    "Phone",
    "PMS",
    "AGO",
    "IK",
    "Total",
    "Frozen"
  ];
  clickedtruck: Truck;
  stage = 1
  albums: any[] = [];

  constructor(
    private dialog: MatDialog,
    private orderservice: OrdersService,
    private notification: NotificationService,
    private core: CoreService,

  ) { }

  ngOnInit(): void {
  }

  filterorders(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.ordersdataSource.filter = filterValue;
  }
  sendSMS(clickedOrder: Order) {
    this.dialog.open(SendMsgComponent, {
      role: "dialog",
      data: [clickedOrder.customer],
      height: "auto"
    });
  }
  /**
   *
   * @param truck
   */
  freezeOrder(order: Order) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      role: "dialog",
      data: order.frozen
        ? "Are you sure you want to restore to normal?"
        : "Freeze this Order? This will disable any modifications"
    });
    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(result => {
        if (result) {
          this.orderservice
            .updateorder(order.Id, this.core.currentOmc.value.Id, order)
            .then(value => {
              this.notification.notify({
                body: "Saved",
                alert_type: "success",
                title: "Success",
                duration: 2000
              });
            });
        }
      });
  }
  /**
   * TODO  Finish up
   */
  exportAsExcelFile(): void {
    // const dialogRef = this.dialog.open(ColumnsCustomizerComponent, {
    //   data: this.ordersdataSource.data[0],
    //   role: "dialog",
    //   width: "70%"
    // });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (result) {
    //     this.excelService.exportAsExcelFile(
    //       this.ordersdataSource.data,
    //       "Orders"
    //     );
    //   }
    // });
    // this.excelService.exportAsExcelFile(this.ordersdataSource.data, 'Orders');
  }
  clickedorder(order: Order) {
    /**
     * do not expand the clicked order
     */
    if (order.stage < 3 || !order.loaded) {
      return;
    }
    this.expandedElement = order;
    // this.componentcommunication.clickedorder.next(order);
    // if (!order.deliveryNote?.photos) {
    //   this.albums = [];
    //   return;
    // }
    // Promise.all(
    //   order.deliveryNote?.photos?.map(async photo => {
    //     const src = await this.getPhotoUrl(photo).toPromise();
    //     console.log(src);
    //     return {
    //       src,
    //       caption: "Image",
    //       thumb: src
    //     };
    //   })
    // ).then(res => {
    //   this.albums = res;
    // });
    // console.log(this.albums);
  }
}
