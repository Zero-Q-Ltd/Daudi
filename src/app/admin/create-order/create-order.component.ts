import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog, MatSort, MatTableDataSource } from "@angular/material";
// import our interface
import { Observable, ReplaySubject, combineLatest } from "rxjs";
import { FormArray, FormControl, FormGroup, FormBuilder } from "ngx-strongly-typed-forms";
import { MapsComponent } from "../maps/maps.component";
import { NotificationService } from "../../shared/services/notification.service";
import { DaudiCustomer, emptyDaudiCustomer } from "../../models/Daudi/customer/Customer";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { CustomerDetail } from "../../models/Daudi/customer/CustomerDetail";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { AdminService } from "../services/core/admin.service";
import { DepotService } from "../services/core/depot.service";
import { CustomerService } from "../services/customers.service";
import { OrdersService } from "../services/orders.service";
import { PricesService } from "../services/prices.service";
import { AngularFireFunctions } from "@angular/fire/functions";
import { map, startWith, takeUntil, skipWhile } from "rxjs/operators";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { ConfirmDepotComponent } from "./components/confirm-depot/confirm-depot.component";
import { OmcService } from "../services/core/omc.service";
import { ConfigService } from "../services/core/config.service";
import { Config, emptyConfig } from "../../models/Daudi/omc/Config";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";
import { Environment } from "../../models/Daudi/omc/Environments";
import { Validators } from "@angular/forms";
import { CreateOrder, OrderFuel } from "../../models/Daudi/forms/CreateOrder";
import { firestore } from "firebase";

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
  omcConfig: Config = { ...emptyConfig };
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
    private depotService: DepotService,
    private customerService: CustomerService,
    private orderservice: OrdersService,
    private omcservice: OmcService,
    private configService: ConfigService,
    private priceservice: PricesService,
    private functions: AngularFireFunctions) {

    combineLatest([
      this.route.params.pipe(
        takeUntil(this.comopnentDestroyed)),
      this.depotService.activedepot.pipe(
        takeUntil(this.comopnentDestroyed),
        skipWhile(t => !t.depot.Id)),
      this.configService.omcconfig.pipe(
        takeUntil(this.comopnentDestroyed),
        skipWhile(t => !t)),
      this.configService.environment
        .pipe(takeUntil(this.comopnentDestroyed)),
      this.omcservice.currentOmc.pipe(
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
        const subscription = this.orderservice.getorder(res[0].id)
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

  contactFormValid(event: boolean) {
    this.validContactForm = event;
  }
  calaculationsFormValid(event: boolean) {
    this.validCalculationForm = event;
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
    return this.customerService.allcustomers.value.filter(value => {
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
    this.temporder.customer.krapin = this.temporder.customer.krapin.toLocaleUpperCase();
    this.temporder.stagedata["1"] = {
      user: this.adminservice.createuserobject(),
      data: null
    };
    this.temporder.config = {
      depot: {
        id: this.depotService.activedepot.value.depot.Id,
        name: this.depotService.activedepot.value.depot.Name
      },
      environment: this.configService.environment.value
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

  contactFormChanges(event: { detail: CustomerDetail, kraModified: boolean }) {
    console.log(event);
    this.temporder.customer = event.detail;
    this.kraModified = event.kraModified;
  }

  updatecompany() {
    return this.customerService.updatecompany(this.temporder.customer.Id).update(this.temporder.customer);
  }

  createorder(redirect) {
    if (this.temporder.Id) {
      this.orderservice.approveOrder(this.temporder);
    } else {
      this.orderservice.createOrder(this.temporder);
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
