import { Component, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource, MatTreeNestedDataSource } from "@angular/material";
import { CompartmentsComponent } from "../compartments/compartments.component";
import { SendMsgComponent } from "../send-msg/send-msg.component";
import { ActivatedRoute } from "@angular/router";
import { NotificationService } from "../../shared/services/notification.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { animate, sequence, state, style, transition, trigger } from "@angular/animations";
import { Truck_ } from "../../models/Truck";
import { Order } from "../../models/Order";
import { SMS } from "../../models/sms";
import { firestore } from "firebase";
import { ReasonComponent } from "../reason/reason.component";
import { ExcelService } from "../services/excel-service.service";
import { ColumnsCustomizerComponent } from "../columns-customizer/columns-customizer.component";
import { AdminsService } from "../services/admins.service";
import { OrdersService } from "../services/orders.service";
import { TrucksService } from "../services/trucks.service";
import { ColNode } from "../../models/ColNode";
import { ComponentCommunicationService } from "../services/component-communication.service";
import { switchMap, takeUntil } from "rxjs/operators";
import { ReplaySubject } from "rxjs";

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

  @Input() queryparams: MatTreeNestedDataSource<ColNode>;
  position = "above";
  position1 = "before";
  position2 = "after";
  position3 = "below";
  ordersdataSource = new MatTableDataSource<Order>();
  stage = 0;
  ordercolumns = ["Id", "Company", "Contact", "Time", "User", "Phone", "PMS", "AGO", "IK", "Total", "Action", "Status"];
  loadingtruck = true;
  clickedtruck: Truck_;
  expandedElement = null;

  loadingordders = true;
  @ViewChild(MatPaginator, { static: false }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private route: ActivatedRoute,
    private dialog: MatDialog,
    private db: AngularFirestore,
    private notification: NotificationService,
    private excelService: ExcelService,
    private adminservice: AdminsService,
    private orderservice: OrdersService,
    private truckservice: TrucksService,
    private componentcommunication: ComponentCommunicationService) {

    this.orderservice.loadingorders.subscribe(value => {
      this.loadingordders = value;
    });

    this.route.params.pipe(takeUntil(this.comopnentDestroyed))
      .pipe(switchMap((paramdata: { stage: number }) => {
        if (paramdata.stage == 4) {
          this.ordercolumns.splice(4, 0, "Time Approved");
        }
        return orderservice.orders[paramdata.stage].pipe(takeUntil(this.comopnentDestroyed));
      }))
      .subscribe((stageorders: Array<Order>) => {
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
        QbId: clickedOrder.company.QbId,
        contactname: clickedOrder.company.contact.name,
        Id: clickedOrder.company.Id,
        name: clickedOrder.company.name,
        phone: clickedOrder.company.phone
      },
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
      timestamp: firestore.Timestamp.now()
    };
    this.dialog.open(SendMsgComponent, {
      role: "dialog",
      data: sms,
      height: "auto"
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
    if (this.queryparams) {
      this.orderservice.querybuild(this.queryparams).get().then((snapshot) => {
        const customerorders = snapshot.docs.map(doc => {
          const value = doc.data();
          value.Id = doc.id;
          return value as Order;
        });
        if (customerorders.length > 0) {
          if (!this.stage) {
            this.ordersdataSource.data = customerorders;
          }
        } else {
          this.ordersdataSource.data = customerorders;
        }
      });
    }
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
        order.stagedata["6"] = {} as any;
        order.stagedata["6"].user = this.adminservice.createuserobject();
        order.stagedata["6"].data = { reason: result };

        this.orderservice.updateorder(order.Id).update(order).then(result => {
          this.notification.notify({
            body: `Order # ${order.QbId} Deleted. It will be permanently deleted after 1 week`,
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
    order.stagedata["6"].user = {
      time: null,
      uid: null,
      name: null
    };
    this.orderservice.updateorder(order.Id).update(order).then(result => {
      this.notification.notify({
        body: `Order # ${order.QbId} Restored`,
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
    trucksdialog.afterClosed().subscribe((result: { order: Order, truck: Truck_ }) => {
      if (!result) {
        return;
      }
      const batchaction = this.db.firestore.batch();
      batchaction.set(this.truckservice.createTruck(result.truck.Id), result.truck);
      batchaction.update(this.orderservice.updateorder(result.order.Id), result.order);
      batchaction.commit().then(result => {
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
