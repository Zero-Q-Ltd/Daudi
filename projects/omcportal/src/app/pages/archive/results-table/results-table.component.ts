import { Component, OnInit, ChangeDetectionStrategy, Input, ViewChild } from '@angular/core';
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
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { trigger, state, style, transition, sequence, animate } from '@angular/animations';
import { ExcelService } from 'app/services/excel-service.service';

@Component({
  selector: 'app-results-table',
  templateUrl: './results-table.component.html',
  styleUrls: ['./results-table.component.scss'],
  animations: [
    trigger("flyIn", [
      state("in", style({ transform: "translateX(0)" })),
      transition("void => *", [
        style({
          height: "*",
          opacity: "0",
          transform: "translateX(-550px)",
          "box-shadow": "none"
        }),
        sequence([
          animate(
            ".20s ease",
            style({
              height: "*",
              opacity: ".2",
              transform: "translateX(0)",
              "box-shadow": "none"
            })
          ),
          animate(
            ".15s ease",
            style({ height: "*", opacity: 1, transform: "translateX(0)" })
          )
        ])
      ])
    ]),
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", display: "none" })
      ),
      state("expanded", style({ height: "*" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      )
    ])
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResultsTableComponent implements OnInit {
  @Input() orders: Order[]
  @Input() loadingordders: Boolean;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ordersdataSource = new MatTableDataSource<Order>();
  typedValue: string;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  expandedElement: Order = null;
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
    private excelService: ExcelService,

  ) { }

  ngOnInit(): void {
  }
  ngOnChanges(changes: any) {
    this.ordersdataSource.data = this.orders
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
    this.excelService.exportAsExcelFile(this.ordersdataSource.data, 'Orders');
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
