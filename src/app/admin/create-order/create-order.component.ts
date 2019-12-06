import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { MatDialog, MatSort, MatTableDataSource } from "@angular/material";
// import our interface
import { Observable, ReplaySubject } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MapsComponent } from "../maps/maps.component";
import { NotificationService } from "../../shared/services/notification.service";
import { Customer, emptycompany } from "../../models/Daudi/customer/Customer";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { AdminService } from "../services/core/admin.service";
import { DepotService } from "../services/core/depot.service";
import { CustomerService } from "../services/customers.service";
import { OrdersService } from "../services/orders.service";
import { PricesService } from "../services/prices.service";
import { AngularFireFunctions } from "@angular/fire/functions";
import { map, startWith, takeUntil, skipWhile } from "rxjs/operators";
import { FuelType, FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { ConfirmDepotComponent } from "./confirm-depot/confirm-depot.component";
import { OmcService } from "../services/core/omc.service";
import { ConfigService } from "../services/core/config.service";
import { Config, emptyConfig } from "../../models/Daudi/omc/Config";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";
import { Environment } from "../../models/Daudi/omc/Environments";

@Component({
  selector: "create-order",
  templateUrl: "./create-order.component.html",
  styleUrls: ["./create-order.component.scss"]
})

export class CreateOrderComponent implements OnDestroy {
  position = "before";
  position1 = "above";
  // for KRA mask
  temporder: Order = Object.assign({}, emptyorder);
  discApproval = false;
  depotsdataSource = new MatTableDataSource<Depot>();
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  companyInfo: {
    newcompany: boolean,
    /**
     * strictly hold information from the database ONLY
     * Have one source of truth and dont mix up the data
     */
    companydata: Customer
  } = {
      newcompany: true,
      companydata: Object.assign({}, emptycompany)
    };

  tempsellingprices = {
    pms: 0,
    ago: 0,
    ik: 0
  };

  kramask = [/^[a-zA-Z]+$/i, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, /^[a-zA-Z]+$/i];

  orderform: FormGroup = new FormGroup({
    pmsqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    agoqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    ikqtyControl: new FormControl("", [Validators.required, Validators.min(1000)]),
    pms: new FormControl({}),
    ago: new FormControl({}),
    ik: new FormControl({})
  });
  contactform: FormGroup = new FormGroup(
    {
      locationControl: new FormControl({ value: "", disabled: true }, [Validators.required]),
      kraControl: new FormControl("", [Validators.required]),
      nameControl: new FormControl("", [Validators.required, Validators.minLength(4)]),
      phoneControl: new FormControl("", [Validators.required, Validators.pattern("[0-9].{8}")]),
      emailControl: new FormControl("", [Validators.required, Validators.email])
    }
  );
  fueltypesArray = FuelNamesArray;
  filteredCompanies: Observable<Customer[]>;
  companyControl = new FormControl();
  loadingcustomers = false;
  queuedorders = [];

  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  currentdepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
  omcConfig: Config = { ...emptyConfig };
  env: Environment = Environment.sandbox;
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


    this.route.params
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((paramdata: { orderid: string }) => {
        if (!paramdata.orderid) {
          console.log("Not discount approval");
          this.depotService.activedepot
            .pipe(
              takeUntil(this.comopnentDestroyed),
              skipWhile(t => !t.depot.Id)
            )
            .subscribe((value) => {
              /**
               * This must execute in this exact order
               */
              this.initfuelprices();
              this.initordersform();
            });
        } else {
          this.discApproval = true;
          const subscription = this.orderservice.getorder(paramdata.orderid).onSnapshot(ordersnapshot => {
            this.temporder = ordersnapshot.data() as Order;
            if (this.temporder.stage !== 1) {
              this.notificationService.notify({
                alert_type: "warning",
                body: "Order has been approved",
                duration: 2000,
                title: "Conflict"
              });
              return;
            }
            this.depotService.activedepot
              .pipe(
                takeUntil(this.comopnentDestroyed),
                skipWhile(t => !t.depot.Id)
              ).subscribe((value) => {
                if (!value.depot.Id) {
                  return;
                }
                /**
                 * This must execute in this exact order
                 */
                this.currentdepot = value;
                this.initfuelprices();
                this.initordersform();
              });
          });
          this.subscriptions.set(`discountorder`, subscription);
        }
        this.configService.environment
          .pipe(takeUntil(this.comopnentDestroyed))
          .subscribe(value => {
            this.env = value;
          });

        this.configService.omcconfig.pipe(
          takeUntil(this.comopnentDestroyed),
          skipWhile(t => !t)
        ).subscribe(val => {
          this.omcConfig = val;
        });

      });

    this.customerService.loadingcustomers
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
        this.loadingcustomers = value;
      });
    this.depotService.alldepots
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        this.depotsdataSource.data = value.filter((n) => n);
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
          QbId: this.companyInfo.companydata.QbId,
          phone: value.phoneControl,
          name: this.companyControl.value,
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
        if (value.pmsqtyControl >= 1000 || value.agoqtyControl >= 1000 || value.ikqtyControl >= 1000) {
          this.orderform.controls.pmsqtyControl.setErrors(null);
          this.orderform.controls.agoqtyControl.setErrors(null);
          this.orderform.controls.ikqtyControl.setErrors(null);
        }
        this.fueltypesArray.forEach((fueltype) => {
          // this.temporder.fuel[fueltype].qty = Number(value[fueltype + "qtyControl"]);
          // this.temporder.fuel[fueltype].priceconfig.price = Number(value[fueltype]);
          // this.temporder.fuel[fueltype].priceconfig.retailprice = this.tempsellingprices[fueltype];
          // this.temporder.fuel[fueltype].priceconfig.minsp = this.currentdepotconfig.minpriceconfig[fueltype].price;
          // const decimamlResolution = value[`${fueltype}qtyControl`] >= 10000 ? 4 : 3;
          // const calculatedpirces = this.deriveprice(this.temporder.fuel[fueltype].priceconfig.price, fueltype as fuelTypes, decimamlResolution);
          // this.temporder.fuel[fueltype].priceconfig.taxablePrice = calculatedpirces.taxablePrice;
          // this.temporder.fuel[fueltype].priceconfig.nonTaxprice = calculatedpirces.pricewithoutvat;

          // const taxcalculations = this.calculatevatamount(this.temporder.fuel[fueltype].priceconfig.taxablePrice, this.temporder.fuel[fueltype].qty);
          // this.temporder.fuel[fueltype].priceconfig.taxAmnt = taxcalculations.taxamount;
          // this.temporder.fuel[fueltype].priceconfig.taxableAmnt = taxcalculations.taxableamount;

          // const totalwithouttax = this.totalswithouttax(this.temporder.fuel[fueltype].priceconfig.nonTaxprice, this.temporder.fuel[fueltype].qty);
          // this.temporder.fuel[fueltype].priceconfig.nonTaxtotal = totalwithouttax;
          // this.temporder.fuel[fueltype].priceconfig.total = taxcalculations.taxamount + totalwithouttax;
          // this.temporder.fuel[fueltype].priceconfig.difference = this.calculateupmark(this.temporder.fuel[fueltype].priceconfig.price, this.temporder.fuel[fueltype].priceconfig.retailprice, this.temporder.fuel[fueltype].qty);

          this.validateandcorrect();
        });
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

  /**
   * uses the simple formula :
   * PricewithoutVAT=OriginalPrice + (0.08*VATExempt)/1.08, simplified
   * Decimal resolution depends on the qty, as above 10000l the point affects significant amount, but at the same time we
   * Dont want decimals at lower quantities
   */
  deriveprice(priceinclusivevat: number, fueltype: FuelType, decimalResolution: number): { pricewithoutvat: number, amountdeducted: number, taxablePrice: number } {
    const pricewithoutvat = Number(((priceinclusivevat + (0.08 * this.configService.getEnvironment().fuelconfig[fueltype].tax.nonTax)) / 1.08).toFixed(decimalResolution));
    const amountdeducted = priceinclusivevat - pricewithoutvat;
    const taxablePrice = Number((pricewithoutvat - this.configService.getEnvironment()[fueltype].tax.nonTax).toFixed(decimalResolution));
    return { pricewithoutvat, amountdeducted, taxablePrice };
  }

  /**
   * calculates the amount of total vat amount
   * @param price price inclusive of VAT
   * @param quantity fuel quantity
   */
  calculatevatamount(price: number, quantity: number): { taxamount: number, taxableamount: number } {
    const taxableamount = Math.round(price * quantity);
    const taxamount = Math.round(taxableamount * .08);
    return { taxamount, taxableamount };
  }

  /**
   * calculates the total amount exclusive of tax
   * @param nontaxprice price exclusive of tax. refer to deriveprice()
   * @param quantity fuel quantity
   */
  totalswithouttax(nontaxprice: number, quantity: number): number {
    // console.log(nontaxprice, quantity);
    return Math.round(nontaxprice * quantity);
  }

  calculateupmark(orderprice: number, retailprice: number, quanity: number): number {
    return Math.round((orderprice - retailprice) * quanity);
  }

  validateandcorrect() {

  }

  initfuelprices() {
    if (!this.discApproval) {
      this.fueltypesArray.forEach((fueltype) => {
        // this.temporder.fuel[fueltype].priceconfig.taxQbId = this.currentdepotconfig.taxconfig[fueltype].QbId ? this.currentdepotconfig.taxconfig[fueltype].QbId : null;
        // this.temporder.fuel[fueltype].priceconfig.nonTax = this.currentdepotconfig.taxconfig[fueltype].nonTax ? Number(this.currentdepotconfig.taxconfig[fueltype].nonTax) : null;
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
        // if (this.currentdepotconfig.fuelconfig[fueltype].price >= this.currentdepotconfig.minpriceconfig[fueltype].price) {
        //   this.tempsellingprices[fueltype] = this.currentdepotconfig.currentpriceconfig[fueltype].price;
        // } else {
        //   this.tempsellingprices[fueltype] = this.currentdepotconfig.minpriceconfig[fueltype].price;
        //   this.notificationService.notify({
        //     alert_type: "notify",
        //     duration: 20000,
        //     title: "Invalid Prices",
        //     body: `The current selling price for ${fueltype} is lower than the Min selling price, hence the Min selling price has been used`
        //   });
        // }
        // this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
        // this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.currentdepotconfig.minpriceconfig[fueltype].price), Validators.required]));
      });
    } else {
      this.fueltypesArray.forEach((fueltype) => {
        this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
        // this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.currentdepotconfig.minpriceconfig[fueltype].price), Validators.required]));
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
    this.filteredCompanies = this.companyControl.valueChanges
      .pipe(
        startWith(""),
        map(value => {
          // this.contactform.reset()
          return this._filter(value);
        })
      );
  }

  ngAfterViewInit() {
    this.depotsdataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.depotsdataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Returns true if this KRA pin has not been used
   */
  searchkra(krapin: string): Customer | undefined {
    return this.customerService.allcustomers.value.filter(value => {
      return value.krapin === krapin;
    })[0];
  }

  determinediscount() {
    if ((this.temporder.fuel.pms.priceconfig.difference + this.temporder.fuel.ago.priceconfig.difference
      + this.temporder.fuel.ik.priceconfig.difference) > 0) {
      return "Upmark " + Number(this.temporder.fuel.pms.priceconfig.difference +
        this.temporder.fuel.ago.priceconfig.difference + this.temporder.fuel.ik.priceconfig.difference);
    } else {
      return "Discount " + Math.abs(Number(this.temporder.fuel.pms.priceconfig.difference +
        this.temporder.fuel.ago.priceconfig.difference + this.temporder.fuel.ik.priceconfig.difference));
    }
  }

  /**
   *
   * redirect specifies whether to redirect to the orders page when the order creation is successful
   */
  checkOrder(redirect: boolean) {
    /**
     * Check if an order is being approved
     */
    const dialogRef = this.dialog.open(ConfirmDepotComponent,
      {
        role: "dialog",
        data: this.depotService.activedepot.value.depot.Name
      });
    dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
      if (result) {
        if (this.discApproval) {
          if (this.userAuthenticated()) {
            this.saveOrder(redirect, 2);
          } else {
            this.notificationService.notify({
              alert_type: "warning",
              body: "You cannot perform this action",
              duration: 2000,
              title: "Not Authenticated"
            });
          }
        } else {
          /**
           * Check if there is a discount request
           * Discount has a -ve value
           */
          if (this.temporder.fuel.pms.priceconfig.difference < 0
            || this.temporder.fuel.ago.priceconfig.difference < 0
            || this.temporder.fuel.ik.priceconfig.difference < 0) {
            this.saveOrder(redirect, this.userAuthenticated() ? 2 : 1);
          } else {
            this.saveOrder(redirect, 2);
          }
        }

      }
    });
  }

  userAuthenticated(): boolean {
    return Number(this.adminservice.userdata.config.level) < 2;
  }

  saveOrder(redirect: boolean, stage: number) {
    this.temporder.stage = stage;
    this.temporder.origin = "backend";
    this.temporder.fuel.pms.QbId = this.configService.getEnvironment().fuelconfig.pms.QbId;
    this.temporder.fuel.ago.QbId = this.configService.getEnvironment().fuelconfig.ago.QbId;
    this.temporder.fuel.ik.QbId = this.configService.getEnvironment().fuelconfig.ik.QbId;
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
    if (this.companyInfo.newcompany) {
      // check if KRA pin is unique
      /**
       * Todo : USe transaction instead
       */
      // this.companyInfo.companydata.sandbox = this.currentdepotconfig.sandbox;
      this.companyInfo.companydata.krapin = this.temporder.customer.krapin;
      if (this.searchkra(this.companyInfo.companydata.krapin)) {
        /**
         * This KRA pin has been used
         */
        this.krausedmsg(this.companyInfo.companydata.krapin);
      } else {
        this.customerService.createcompany(this.companyInfo.companydata).pipe(takeUntil(this.comopnentDestroyed)).subscribe((newcompany: Customer) => {
          this.notificationService.notify({
            duration: 2000,
            title: "Synchronising",
            body: "Waiting For Quickboocks",
            alert_type: "notify"
          });
          this.companyInfo.companydata = newcompany;
          this.temporder.customer.QbId = newcompany.QbId;
          this.temporder.customer.name = newcompany.name.toUpperCase();
          this.createorder(redirect);
        });
      }

    } else {
      console.log("Not new company");
      console.log(this.temporder);
      /**
       * Conditionally update company if information has changed
       */
      if (this.temporder.customer.krapin !== this.companyInfo.companydata.krapin || JSON.stringify(this.temporder.customer.contact) !== JSON.stringify(this.companyInfo.companydata.contact)) {
        this.notificationService.notify({
          duration: 2000,
          title: "Updating",
          body: "Updating Company Info",
          alert_type: "notify"
        });
        /**
         * Check if kra pin has been modified and update if so
         */
        if (this.temporder.customer.krapin !== this.companyInfo.companydata.krapin) {
          /**
           * make sure the kra pin is unique
           */
          if (this.searchkra(this.temporder.customer.krapin)) {
            /**
             * this KRA pin has been used
             */
            this.krausedmsg(this.companyInfo.companydata.krapin);
          } else {
            this.updatecompany().then(() => {
              this.createorder(redirect);
            });
          }
        } else {
          this.updatecompany().then(() => {
            this.createorder(redirect);
          });
        }
      } else {
        this.createorder(redirect);
      }
    }
  }

  companyselect(selectedcompany: Customer) {
    this.companyInfo.newcompany = false;
    this.companyInfo.companydata = selectedcompany;
    this.contactform.controls.kraControl.setValue(selectedcompany.krapin, { emitEvent: false });
    this.contactform.controls.nameControl.setValue(selectedcompany.contact[0].name, { emitEvent: false });
    this.contactform.controls.phoneControl.setValue(selectedcompany.contact[0].phone, { emitEvent: false });
    this.contactform.controls.emailControl.setValue(selectedcompany.contact[0].email, { emitEvent: false });
    this.temporder.customer.QbId = selectedcompany.QbId;
    this.temporder.customer.name = selectedcompany.name;
    this.temporder.customer.krapin = selectedcompany.krapin;
    this.temporder.customer.phone = selectedcompany.contact[0].phone;
    this.temporder.customer.contact = selectedcompany.contact;
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
    return this.customerService.updatecompany(this.companyInfo.companydata.Id).update(this.temporder.customer);
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

  private _filter(value: string): Customer[] {
    if (!value) {
      return;
    }
    const filterValue = value.toLowerCase();

    return this.customerService.allcustomers.value.filter(option => option.name.toLowerCase().includes(filterValue));
  }
}
