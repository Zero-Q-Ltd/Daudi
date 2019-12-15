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
        takeUntil(this.comopnentDestroyed),
        map((paramdata: { orderid: string }) => paramdata)),
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
      if (!res[0].orderid) {
        console.log("Not discount approval");
        /**
         * This must execute in this exact order
         */
        this.activedepot = res[1];
        this.omcConfig = res[2];
        this.env = res[3];
        this.initfuelprices();
        this.initordersform();
      } else {
        console.log("Discount approval");
        console.log(res);
        const subscription = this.orderservice.getorder(res[0].orderid).onSnapshot(ordersnapshot => {
          this.temporder = ordersnapshot.data() as Order;
          if (this.temporder.stage !== 1) {
            this.notificationService.notify({
              alert_type: "warning",
              body: "Order has been approved",
              duration: 2000,
              title: "Conflict"
            });
            return;
          } else {
            /**
             * This must execute in this exact order
             */
            this.activedepot = res[1];
            this.omcConfig = res[2];
            this.env = res[3];
            this.initfuelprices();
            this.initordersform();
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
    this.contactform.valueChanges
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        this.temporder.customer = {
          QbId: "this.companyInfo.companydata.QbId",
          name: "this.companyControl.value",
          Id: null,
          contact: [{
            email: value.emailControl,
            name: value.nameControl,
            phone: value.phoneControl
          }],
          krapin: value.kraControl
        };
      });
    this.orderform.valueChanges
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        // if (value.pmsqtyControl >= 1000 || value.agoqtyControl >= 1000 || value.ikqtyControl >= 1000) {
        //   this.orderform.controls.pmsqtyControl.setErrors(null);
        //   this.orderform.controls.agoqtyControl.setErrors(null);
        //   this.orderform.controls.ikqtyControl.setErrors(null);
        // }
        // this.fueltypesArray.forEach((fueltype) => {
        //   this.temporder.fuel[fueltype].qty = Number(value[fueltype + "qtyControl"]);
        //   this.temporder.fuel[fueltype].priceconfig.price = Number(value[fueltype]);
        //   this.temporder.fuel[fueltype].priceconfig.retailprice = this.tempsellingprices[fueltype];
        //   this.temporder.fuel[fueltype].priceconfig.minsp = this.activedepot.config.price[fueltype].minPrice;
        //   const decimamlResolution = value[`${fueltype}qtyControl`] >= 10000 ? 4 : 3;
        //   const calculatedpirces = this.deriveprice(this.temporder.fuel[fueltype].priceconfig.price, fueltype, decimamlResolution);
        //   this.temporder.fuel[fueltype].priceconfig.taxablePrice = calculatedpirces.taxablePrice;
        //   this.temporder.fuel[fueltype].priceconfig.nonTaxprice = calculatedpirces.pricewithoutvat;

        //   const totalwithouttax = this.totalswithouttax(this.temporder.fuel[fueltype].priceconfig.nonTaxprice, this.temporder.fuel[fueltype].qty);
        //   this.temporder.fuel[fueltype].priceconfig.nonTaxtotal = totalwithouttax;

        //   // this.temporder.fuel[fueltype].priceconfig.total = taxcalculations.taxamount + totalwithouttax;
        //   this.temporder.fuel[fueltype].priceconfig.total = this.temporder.fuel[fueltype].priceconfig.price * this.temporder.fuel[fueltype].qty;

        //   this.temporder.fuel[fueltype].priceconfig.taxAmnt = this.temporder.fuel[fueltype].priceconfig.total - totalwithouttax;
        //   this.temporder.fuel[fueltype].priceconfig.taxableAmnt = totalwithouttax;

        //   this.temporder.fuel[fueltype].priceconfig.difference =
        //     this.calculateupmark(this.temporder.fuel[fueltype].priceconfig.price, this.temporder.fuel[fueltype].priceconfig.retailprice, this.temporder.fuel[fueltype].qty);
        //   this.validateandcorrect();
        // });
      });
  }
  position = "before";
  position1 = "above";
  temporder: Order = { ...emptyorder };
  discApproval = false;
  tempsellingprices = {
    pms: 0,
    ago: 0,
    ik: 0
  };

  kramask = [/^[a-zA-Z]+$/i, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];

  orderform = new FormGroup({
    pmsqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    agoqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    ikqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    pms: new FormControl({}),
    ago: new FormControl({}),
    ik: new FormControl({})
  });

  contactform = new FormGroup(
    {
      locationControl: new FormControl({ value: "", disabled: true }, [Validators.required]),
      kraControl: new FormControl("", [Validators.required]),
      nameControl: new FormControl("", [Validators.required, Validators.minLength(4)]),
      phoneControl: new FormControl("", [Validators.required, Validators.pattern("[0-9].{8}")]),
      emailControl: new FormControl("", [Validators.required, Validators.email])
    }
  );

  fueltypesArray = FuelNamesArray;
  companyControl = new FormControl();
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

  contactFormChanges(event: { detail: CustomerDetail, kraModified: boolean }) {
    console.log(event);
    this.temporder.customer = event.detail;
    this.kraModified = event.kraModified;
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



  validateandcorrect() {

  }

  initfuelprices() {
    if (!this.discApproval) {
      this.fueltypesArray.forEach((fueltype) => {
        this.temporder.fuel[fueltype].priceconfig.taxQbId = this.omcConfig.Qbo[this.env].taxConfig.taxCode.Id;
        this.temporder.fuel[fueltype].priceconfig.nonTax = this.omcConfig.taxExempt[this.env][fueltype].amount;
        /**
         * force the form to detect a change so that calculations are redone
         */
        this.orderform.updateValueAndValidity();
      });
    } else {
      /**
       * force the form to detect a change so that calculations are redone
       */
      this.orderform.updateValueAndValidity();
    }

  }

  initordersform() {
    if (!this.discApproval) {
      this.temporder.notifications = {
        /**
         * Initialise these variables default as false for sandbox environment
         */
        sms: this.configService.environment.value === "sandbox" ? false : true,
        email: this.configService.environment.value === "sandbox" ? false : true
      };
      /**
       * @todo finish min price calculation logic
       */
      this.fueltypesArray.forEach((fueltype: FuelType) => {
        /**
         * Make sure that the current selling price is lower than the min selling price for the most recent entry
         */
        if (this.activedepot.config.price[fueltype].price >= this.activedepot.config.price[fueltype].minPrice) {
          this.tempsellingprices[fueltype] = this.activedepot.config.price[fueltype].minPrice;
        } else {
          this.tempsellingprices[fueltype] = this.activedepot.config.price[fueltype].price;
          this.notificationService.notify({
            alert_type: "notify",
            duration: 20000,
            title: "Invalid Prices",
            body: `The current selling price for ${fueltype} is lower than the Min selling price, hence the Min selling price has been used`
          });
        }
        this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
        this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.activedepot.config.price[fueltype].minPrice), Validators.required]));
      });
    } else {
      this.fueltypesArray.forEach((fueltype) => {
        this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
        this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.activedepot.config.price[fueltype].price), Validators.required]));
      });
    }
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

  applyFilter(filterValue: string) {
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
   *
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
      this.updatecompany().then(() => {
        this.createorder(redirect);
      });
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

  updatecompany() {
    return this.customerService.updatecompany(this.temporder.customer.Id).update(this.temporder.customer);
  }

  createorder(redirect) {
    this.orderservice.createorder(this.temporder);
    if (redirect) {
      /**
       * navigate away from the page if the user intends fro it
       */
      this.router.navigate(["admin/orders-table/1"]);
    } else {
      /**
       * reset fields in preparation fro a new order
       */
      this.contactform.reset();
      this.companyControl.reset();
      this.orderform.reset();
      /**
       * re-populate the prices
       */
      this.initfuelprices();
      this.initordersform();
    }
    this.notificationService.notify({
      duration: 2000,
      title: "Queued",
      body: "Order will be processed in the background"
    });
  }


}
