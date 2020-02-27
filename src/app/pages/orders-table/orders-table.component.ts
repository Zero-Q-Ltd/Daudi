import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ColumnsCustomizerComponent } from "app/components/columns-customizer/columns-customizer.component";
import { ConfirmDialogComponent } from "app/components/confirm-dialog/confirm-dialog.component";
import { ReasonComponent } from "app/components/reason/reason.component";
import { SendMsgComponent } from "app/components/send-msg/send-msg.component";
import { CompartmentsComponent } from "app/pages/orders-table/components/compartments/compartments.component";
import { ComponentCommunicationService } from "app/services/component-communication.service";
import { AdminService } from "app/services/core/admin.service";
import { CoreService } from "app/services/core/core.service";
import { ExcelService } from "app/services/excel-service.service";
import { OrdersService } from "app/services/orders.service";
import { ReplaySubject } from "rxjs";
import { switchMap, takeUntil } from "rxjs/operators";
import { EmptyGenericStage } from "../../models/Daudi/order/GenericStage";
import { Order } from "../../models/Daudi/order/Order";
import { Truck } from "../../models/Daudi/order/truck/Truck";
import { SMS } from "../../models/Daudi/sms/sms";
import { MyTimestamp } from "../../models/firestore/firestoreTypes";
import { NotificationService } from "../../shared/services/notification.service";
import { TooltipPosition } from '@angular/material/tooltip';

const EXCEL_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
const EXCEL_EXTENSION = ".xlsx";

@Component({
  selector: "orders-table",
  templateUrl: "./orders-table.component.html",
  styleUrls: ["./orders-table.component.scss"],
  animations: [
    trigger("flyIn", [
      state("in", style({ transform: "translateX(0)" })),
      transition("void => *", [
        style({ height: "*", opacity: "0", transform: "translateX(-550px)", "box-shadow": "none" }),
        sequence([
          animate(".20s ease", style({ height: "*", opacity: ".2", transform: "translateX(0)", "box-shadow": "none" })),
          animate(".15s ease", style({ height: "*", opacity: 1, transform: "translateX(0)" }))
        ])
      ])
    ]),
    trigger("detailExpand", [
      state("collapsed", style({ height: "0px", minHeight: "0", display: "none" })),
      state("expanded", style({ height: "*" })),
      transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
    ])]
})

export class OrdersTableComponent implements OnInit, OnDestroy {

  position: TooltipPosition = "above";
  position1: TooltipPosition = "before";
  position2: TooltipPosition = "after";
  position3: TooltipPosition = "below";
  ordersdataSource = new MatTableDataSource<Order>();
  stage = 0;
  ordercolumns = ["Id", "Company", "Contact", "Time", "User", "Phone", "PMS", "AGO", "IK", "Total", "Action", "Frozen"];
  loadingtruck = true;
  clickedtruck: Truck;
  expandedElement = null;

  loadingordders = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  typedValue: string

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private db: AngularFirestore,
    private notification: NotificationService,
    private excelService: ExcelService,
    private adminservice: AdminService,
    private orderservice: OrdersService,
    private router: Router,
    private core: CoreService,
    private componentcommunication: ComponentCommunicationService) {

    this.core.loaders.orders.subscribe(value => {
      this.loadingordders = value;
    });

    this.route.params.pipe(takeUntil(this.comopnentDestroyed))
      .pipe(switchMap((paramdata: { stage: number }) => {
        if (paramdata.stage === 4) {
          this.ordercolumns.splice(4, 0, "Time Approved");
        }
        return core.orders[paramdata.stage].pipe(takeUntil(this.comopnentDestroyed));
      }))
      .subscribe((stageorders: Order[]) => {
        this.ordersdataSource.data = stageorders;
      });
    this.componentcommunication.truckDeleted.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      if (value) {
        return this.truckDeleted();
      }
    });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  /**
   * TODO  Finish up
   */
  exportAsExcelFile(): void {
    const dialogRef = this.dialog.open(ColumnsCustomizerComponent,
      {
        data: this.ordersdataSource.data[0],
        role: "dialog",
        width: "70%"
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.excelService.exportAsExcelFile(this.ordersdataSource.data, "Orders");
      }
    });
    // this.excelService.exportAsExcelFile(this.ordersdataSource.data, 'Orders');
  }

  isauthenticated(level) {
    return this.adminservice.userdata.config.level <= level;
  }

  sendSMS(clickedOrder: Order) {
    const sms: SMS = {
      Id: null,
      company: {
        QbId: clickedOrder.customer.QbId,
        Id: clickedOrder.customer.Id,
        name: clickedOrder.customer.name,
        krapin: clickedOrder.customer.krapin
      },
      contact: clickedOrder.customer.contact,
      type: {
        reason: null,
        origin: "custom"
      },
      greeting: "Jambo",
      msg: null,
      status: {
        delivered: false,
        sent: false
      },
      timestamp: MyTimestamp.now()
    };
    this.dialog.open(SendMsgComponent, {
      role: "dialog",
      data: sms,
      height: "auto"
    });
  }

  /**
   *
   * @param truck
   */
  freezeOrder(order: Order) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent,
      {
        role: "dialog",
        data: order.frozen ? "Are you sure you want to restore to normal?" : "Freeze this Order? This will disable any modifications"
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        this.orderservice.updateorder(order.Id, this.core.currentOmc.value.Id, order).then(value => {
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

  clickedorder(order: Order) {
    /**
     * do not expand the clicked order
     */
    if (order.stage < 3 || !order.loaded) {
      return;
    }
    this.expandedElement = order;
    this.componentcommunication.clickedorder.next(order);
  }

  truckDeleted() {
    this.expandedElement = null;
    this.componentcommunication.clickedorder.next(null);
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    this.ordersdataSource.sort = this.sort;
    this.ordersdataSource.paginator = this.paginator;

  }

  filterorders(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
    this.ordersdataSource.filter = filterValue;
  }

  approveOrder(order: Order) {
    this.router.navigate(["/approve-order/", order.Id]);
  }

  /**
   *
   * @param {Order} order
   */
  deleteorder(order: Order) {
    const dialogRef = this.dialog.open(ReasonComponent,
      {
        role: "dialog"
      });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        order.stage = 6;
        order.orderStageData["6"] = {} as any;
        order.orderStageData["6"].user = this.adminservice.createUserObject();
        // order.stagedata["6"].data = { reason: result };

        this.orderservice.updateorder(order.Id, this.core.currentOmc.value.Id, order).then(result => {
          this.notification.notify({
            body: `Order # ${order.QbConfig} Deleted. It will be permanently deleted after 1 week`,
            title: "Deleted",
            alert_type: "warning",
            duration: 2000
          });
        });
      } else {
        this.notification.notify({
          body: `Changes discarded`,
          title: "",
          alert_type: "notify"
        });
      }
    });
  }

  /**
   *
   * @param order
   */
  restoreOrder(order: Order) {
    order.stage = 1;
    order.orderStageData["6"] = { ...EmptyGenericStage };
    this.orderservice.updateorder(order.Id, this.core.currentOmc.value.Id, order).then(result => {
      this.notification.notify({
        body: `Order # ${order.QbConfig} Restored`,
        alert_type: "success",
        title: "Success",
        duration: 2000
      });
    });
  }

  loadTrucks(order) {
    const trucksdialog = this.dialog.open(CompartmentsComponent, {
      role: "dialog",
      data: order,
      height: "auto",
      disableClose: true

    });
    trucksdialog.afterClosed().subscribe((result: { order: Order, truck: Truck }) => {
      if (!result) {
        return;
      }

      this.orderservice.updateorder(result.order.Id, this.core.currentOmc.value.Id, result.order).then(result => {
        this.notification.notify({
          body: "Truck created",
          alert_type: "success",
          title: "Success",
          duration: 2000
        });
      });
    });

  }
}
