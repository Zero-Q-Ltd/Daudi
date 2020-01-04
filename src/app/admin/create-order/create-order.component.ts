import { Component, OnDestroy } from "@angular/core";
import { MatDialog } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import { firestore } from "firebase";
// import our interface
import { combineLatest, ReplaySubject } from "rxjs";
import { skipWhile, takeUntil } from "rxjs/operators";
import { DaudiCustomer } from "../../models/Daudi/customer/Customer";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";
import { FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { OMCConfig, emptyConfig } from "../../models/Daudi/omc/Config";
import { Environment } from "../../models/Daudi/omc/Environments";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { NotificationService } from "../../shared/services/notification.service";
import { MapsComponent } from "../maps/maps.component";
import { AdminService } from "../services/core/admin.service";
import { CoreService } from "../services/core/core.service";
import { CustomerService } from "../services/customers.service";
import { OrdersService } from "../services/orders.service";
import { ConfirmDepotComponent } from "./components/confirm-depot/confirm-depot.component";

@Component({
  selector: "create-order",
  templateUrl: "./create-order.component.html",
  styleUrls: ["./create-order.component.scss"]
})

export class CreateOrderComponent implements OnDestroy {

  kramask = [/^[a-zA-Z]+$/i, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];
  newOrder = true;

  fueltypesArray = FuelNamesArray;
  queuedorders = [];

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  activedepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
  omcConfig: OMCConfig = { ...emptyConfig };
  env: Environment = Environment.sandbox;

  kraModified = false;
  validContactForm = false;
  validCalculationForm = false;
  orderError = false;

  position = "before";
  position1 = "above";
  temporder: Order = { ...emptyorder };
  tempsellingprices = {
    pms: 0,
    ago: 0,
    ik: 0
  };

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private dialog: MatDialog,
    private route: ActivatedRoute,
    private adminservice: AdminService,
    private customerService: CustomerService,
    private orderservice: OrdersService,
    private core: CoreService,
  ) {

    combineLatest([
      this.route.params.pipe(
        takeUntil(this.comopnentDestroyed)),
      this.core.activedepot.pipe(
        takeUntil(this.comopnentDestroyed),
        skipWhile(t => !t.depot.Id)),
      this.core.config.pipe(
        takeUntil(this.comopnentDestroyed),
        skipWhile(t => !t)),
      this.core.environment
        .pipe(takeUntil(this.comopnentDestroyed)),
      this.core.currentOmc.pipe(
        takeUntil(this.comopnentDestroyed),
        skipWhile(t => !t.Id))
    ]).subscribe(res => {
      this.activedepot = res[1];
      this.omcConfig = res[2];
      this.env = res[3];

      if (this.router.url === "/admin/create-order") {
        console.log("New Order");
        this.newOrder = true;
      } else {
        console.log("Order approval");
        if (!res[0].id) {
          return console.error("Empty params for Order approval");
        }
        this.newOrder = false;
        const subscription = this.orderservice.getOrder(res[0].id, this.core.currentOmc.value.Id)
          .onSnapshot(ordersnapshot => {
            if (ordersnapshot.exists) {
              this.temporder = ordersnapshot.data() as Order;
              if (this.temporder.stage !== 1) {
                this.notificationService.notify({
                  alert_type: "warning",
                  body: "Order has been approved",
                  duration: 2000,
                  title: "Conflict"
                });
                this.orderError = true;
                return;
              }
            } else {
              this.orderError = true;
              this.notificationService.notify({
                alert_type: "error",
                body: "No order found with this ID",
                duration: 2000,
                title: "ERROR"
              });
            }

          });
        this.subscriptions.set(`discountorder`, subscription);
      }
    });
    this.orderservice.queuedorders
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
        this.queuedorders = value;
      });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }
  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  openmaps() {
    const dialogRef = this.dialog.open(MapsComponent,
      {
        // data: this.currentdepotconfig
      });
    dialogRef.disableClose = true;
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe((result) => {
      if (result !== false) {
        console.log(result);
      }
    });
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
  }

  /**
   * Returns true if this KRA pin has not been used
   */
  searchkra(krapin: string): DaudiCustomer | undefined {
    return this.core.customers.value.filter(value => {
      return value.krapin === krapin;
    })[0];
  }

  /**
   * redirect specifies whether to redirect to the orders page when the order creation is successful
   */
  checkOrder(redirect: boolean) {

    const dialogRef = this.dialog.open(ConfirmDepotComponent,
      {
        role: "dialog",
        data: this.activedepot.depot.Name
      });
    dialogRef.afterClosed()
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(result => {
        if (result) {
          /**
           * @todo
           * Check if there is a discount request
           * Discount has a -ve value
           */
          if (this.temporder.fuel.pms.priceconfig.difference < 0
            || this.temporder.fuel.ago.priceconfig.difference < 0
            || this.temporder.fuel.ik.priceconfig.difference < 0) {
            this.saveOrder(redirect);
          } else {
            this.saveOrder(redirect);
          }
        }
      });
  }

  saveOrder(redirect: boolean) {
    this.temporder.stage = 1;
    this.temporder.origin = "backend";
    this.temporder.QbConfig.departmentId = this.activedepot.config.QbId;
    console.log(this.temporder);
    this.temporder.customer.krapin = this.temporder.customer.krapin.toLocaleUpperCase();
    this.temporder.stagedata["1"] = {
      user: this.adminservice.createuserobject(),
      data: null
    };
    this.temporder.config = {
      depot: {
        id: this.core.activedepot.value.depot.Id,
        name: this.core.activedepot.value.depot.Name
      },
      environment: this.core.environment.value
    };
    if (!this.temporder.customer.QbId) {
      // check if KRA pin is unique
      /**
       * @Todo : USe transaction instead
       */
      // this.companyInfo.companydata.sandbox = this.currentdepotconfig.sandbox;
      if (this.searchkra(this.temporder.customer.krapin)) {
        /**
         * This KRA pin has been used
         */
        this.krausedmsg(this.temporder.customer.krapin);
      } else {
        const newCustomer: DaudiCustomer = {
          Active: true,
          Id: this.temporder.customer.Id,
          QbId: this.temporder.customer.QbId,
          balance: 0,
          contact: this.temporder.customer.contact,
          environment: this.env,
          krapin: this.temporder.customer.krapin,
          kraverified: null,
          location: new firestore.GeoPoint(0, 38),
          name: this.temporder.customer.name
        };
        this.customerService.createcompany(newCustomer)
          .pipe(takeUntil(this.comopnentDestroyed))
          .subscribe((newcompany: DaudiCustomer) => {
            this.notificationService.notify({
              duration: 2000,
              title: "Synchronising",
              body: "Waiting For Quickboocks",
              alert_type: "notify"
            });
            this.temporder.customer.QbId = newcompany.QbId;
            this.temporder.customer.name = newcompany.name.toUpperCase();
            this.createorder(redirect);
          });
      }

    } else {
      console.log("Not new company");
      console.log(this.temporder);
      this.createorder(redirect);

      // this.updatecompany().then(() => {
      //   this.createorder(redirect);
      // });
    }
  }


  krausedmsg(krapin: string) {
    const companyused = this.searchkra(krapin);
    this.notificationService.notify({
      duration: 2000,
      title: "Error",
      body: `This KRA pin is already used by ${companyused.name} Id ${companyused.QbId} `,
      alert_type: "error"
    });
  }

  updateCustomer() {
    // return this.customerService.updateCustomer(this.temporder.customer, this.core.currentOmc.value.Id).update(this.temporder.customer);
  }

  createorder(redirect) {
    if (this.temporder.Id) {
      // this.orderservice.approveOrder(this.temporder);
    } else {
      // this.orderservice.createOrder(this.temporder);
    }
    if (redirect) {
      /**
       * navigate away from the page if the user intends fro it
       */
      this.router.navigate(["admin/orders-table/1"]);
    } else {
      this.temporder = { ...emptyorder };
    }
    this.notificationService.notify({
      duration: 2000,
      title: "Queued",
      body: "Order will be processed in the background"
    });
  }


}
