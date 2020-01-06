import {Component, EventEmitter, Input, OnChanges, OnInit, Output} from "@angular/core";
import {Validators} from "@angular/forms";
import {FormControl, FormGroup} from "ngx-strongly-typed-forms";
import {ReplaySubject} from "rxjs";
import {skipWhile, takeUntil} from "rxjs/operators";
import {CoreService} from "../../../services/core/core.service";
import {Depot, emptydepot} from "./../../../../models/Daudi/depot/Depot";
import {DepotConfig, emptyDepotConfig} from "./../../../../models/Daudi/depot/DepotConfig";
import {Calculations, FuelCalculation} from "./../../../../models/Daudi/forms/Calculations";
import {FuelNamesArray, FuelType} from "./../../../../models/Daudi/fuel/FuelType";
import {emptyConfig, OMCConfig} from "./../../../../models/Daudi/omc/Config";
import {Order} from "./../../../../models/Daudi/order/Order";
import {NotificationService} from "./../../../../shared/services/notification.service";
import {EmptyOMCStock, OMCStock} from "../../../../models/Daudi/omc/Stock";

@Component({
  selector: "app-calculations",
  templateUrl: "./calculations.component.html",
  styleUrls: ["./calculations.component.scss"]
})
export class CalculationsComponent implements OnInit, OnChanges {
  @Input() initData: Order;
  @Input() newOrder: boolean;

  @Output() initDataChange = new EventEmitter<Order>();
  @Output() formValid = new EventEmitter<boolean>();

  fueltypesArray = FuelNamesArray;
  omcConfig: OMCConfig = { ...emptyConfig };
  activedepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
  stock: OMCStock = { ...EmptyOMCStock };
  calculationsForm: FormGroup<Calculations> = new FormGroup<Calculations>({
    pms: new FormGroup<FuelCalculation>({
      price: new FormControl<number>(0, [Validators.required]),
      qty: new FormControl<number>(0, [Validators.required, Validators.min(1000)]),
    }),
    ago: new FormGroup<FuelCalculation>({
      price: new FormControl<number>(0, [Validators.required]),
      qty: new FormControl<number>(0, [Validators.required, Validators.min(1000)]),
    }),
    ik: new FormGroup<FuelCalculation>({
      price: new FormControl<number>(0, [Validators.required]),
      qty: new FormControl<number>(0, [Validators.required, Validators.min(1000)]),
    })
  });

  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();


  constructor(
    private core: CoreService,
    private notificationService: NotificationService,

  ) {

    this.core.config.pipe(
      takeUntil(this.comopnentDestroyed)
    ).subscribe(val => {
      this.omcConfig = val;
    });
    this.core.stock.pipe(
      takeUntil(this.comopnentDestroyed)
    ).subscribe(val => {
      this.stock = val;
    });
    this.core.activedepot.pipe(
      takeUntil(this.comopnentDestroyed),
      skipWhile(t => !t.depot.Id))
      .subscribe(dep => {
        this.activedepot = dep;
      });

    this.calculationsForm.valueChanges
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        /**
         * Validate both quantities and prices
         */
        if ((value.pms.qty >= 1000 || value.ago.qty >= 1000 || value.ik.qty >= 1000) &&
          (value.pms.price >= this.initData.fuel.pms.priceconfig.minsp ||
            value.ago.price >= this.initData.fuel.ago.priceconfig.minsp ||
            value.ik.price >= this.initData.fuel.ik.priceconfig.minsp)
        ) {
          this.fueltypesArray.forEach(fueltype => {
            console.log("prices and quantity valid");
            /**
             * Clear error that might exist on other fields
             */
            this.calculationsForm.get([fueltype, "qty"]).setErrors(null);
            this.calculationsForm.get([fueltype, "price"]).setErrors(null);
            this.initData.fuel[fueltype].qty = value[fueltype].qty;
            this.initData.fuel[fueltype].priceconfig.price = Number(value[fueltype].price);
            /**
             * The requested price is only set during new order creation
             * Set the value to price, then replicate to requested price
             * This is the single source of truth and is the field used for making all calculations, even during order creation
             * It is overwritten during approval, but the requested price value remains the original one durin creation
             */
            if (this.newOrder) {
              this.initData.fuel[fueltype].priceconfig.requestedPrice = Number(value[fueltype].price);
            }
            const decimamlResolution = value[`${fueltype}qtyControl`] >= 10000 ? 4 : 3;
            const calculatedpirces = this.deriveprice(this.initData.fuel[fueltype].priceconfig.price, fueltype, decimamlResolution);
            this.initData.fuel[fueltype].priceconfig.taxablePrice = calculatedpirces.taxablePrice;
            this.initData.fuel[fueltype].priceconfig.nonTaxprice = calculatedpirces.pricewithoutvat;
            const totalwithouttax = this.totalswithouttax(this.initData.fuel[fueltype].priceconfig.nonTaxprice, this.initData.fuel[fueltype].qty);
            /**
             * modify the nox tax price to be an exact figurea after rounding off
             */
            this.initData.fuel[fueltype].priceconfig.nonTaxprice = (totalwithouttax / this.initData.fuel[fueltype].qty);
            this.initData.fuel[fueltype].priceconfig.nonTaxtotal = totalwithouttax;
            // this.initData.fuel[fueltype].priceconfig.total = taxcalculations.taxamount + totalwithouttax;
            this.initData.fuel[fueltype].priceconfig.total = this.initData.fuel[fueltype].priceconfig.price * this.initData.fuel[fueltype].qty;

            this.initData.fuel[fueltype].priceconfig.taxAmnt = this.initData.fuel[fueltype].priceconfig.total - totalwithouttax;
            this.initData.fuel[fueltype].priceconfig.taxableAmnt = totalwithouttax;

            this.initData.fuel[fueltype].priceconfig.difference = this.calculateupmark(
              this.initData.fuel[fueltype].priceconfig.price,
              this.initData.fuel[fueltype].priceconfig.retailprice,
              this.initData.fuel[fueltype].qty);
          });
        }
        /**
         * emit the form validity
         */
        this.formValid.emit(this.calculationsForm.valid);
        this.initDataChange.emit(this.initData);

      });
  }
  ngOnChanges(changes: any) {
    this.fueltypesArray.forEach(fueltype => {
      /**
       * Make sure that the current selling price is lower than the min selling price for the most recent entry
       */
      let tempPrice = 0;
      if (this.initData.fuel[fueltype].priceconfig.retailprice >= this.initData.fuel[fueltype].priceconfig.minsp) {
        tempPrice = this.initData.fuel[fueltype].priceconfig.retailprice;
      } else {
        tempPrice = this.initData.fuel[fueltype].priceconfig.minsp;
        this.notificationService.notify({
          alert_type: "notify",
          duration: 20000,
          title: "Invalid Prices",
          body: `The current selling price for ${fueltype} is lower than the Min selling price, hence the Min selling price has been used`
        });
      }
      /**
       * update order price values
       */
      this.initData.fuel[fueltype].priceconfig.retailprice = this.activedepot.config.price[fueltype].price;
      this.initData.fuel[fueltype].priceconfig.minsp = this.activedepot.config.price[fueltype].minPrice;
      // this.initData.fuel[fueltype].priceconfig.nonTax = this.omcConfig.taxExempt[this.env][fueltype].amount;

      this.calculationsForm.get([fueltype, "price"]).setValidators(Validators.min(this.activedepot.config.price[fueltype].minPrice));

      /**
       * DOnt overwrite value for order approval
       */
      if (this.newOrder) {
        this.calculationsForm.get([fueltype, "price"]).setValue(tempPrice, { emitEvent: false });
      } else {
        this.calculationsForm.get([fueltype, "price"]).setValue(this.initData.fuel[fueltype].priceconfig.price, { emitEvent: false });
        this.calculationsForm.get([fueltype, "qty"]).setValue(this.initData.fuel[fueltype].qty, { emitEvent: false });
      }
      /**
       * update calculations as well
       */
    });
    this.calculationsForm.updateValueAndValidity();

  }

  ngOnInit() {


  }

  determinediscount() {
    if ((this.initData.fuel.pms.priceconfig.difference + this.initData.fuel.ago.priceconfig.difference
      + this.initData.fuel.ik.priceconfig.difference) > 0) {
      return "Upmark " + Number(this.initData.fuel.pms.priceconfig.difference +
        this.initData.fuel.ago.priceconfig.difference + this.initData.fuel.ik.priceconfig.difference);
    } else {
      return "Discount " + Math.abs(Number(this.initData.fuel.pms.priceconfig.difference +
        this.initData.fuel.ago.priceconfig.difference + this.initData.fuel.ik.priceconfig.difference));
    }
  }

  /**
   * uses the simple formula :
   * PricewithoutVAT=(OriginalPrice + (0.08*VATExempt))/1.08, simplified
   * Decimal resolution depends on the qty, as above 10000l the point affects significant amount, but at the same time we
   * Dont want decimals at lower quantities
   */
  deriveprice(priceinclusivevat: number, fueltype: FuelType, decimalResolution: number) {
    const pricewithoutvat = Number(((priceinclusivevat + (0.08 * this.initData.fuel[fueltype].priceconfig.nonTax)) / 1.08).toFixed(decimalResolution));
    const amountdeducted = priceinclusivevat - pricewithoutvat;
    const taxablePrice = Number((pricewithoutvat - this.initData.fuel[fueltype].priceconfig.nonTax).toFixed(decimalResolution));
    return { pricewithoutvat, amountdeducted, taxablePrice };
  }
  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
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

}
