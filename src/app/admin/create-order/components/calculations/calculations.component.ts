import { Component, OnInit, Input, Output } from "@angular/core";
import { Order } from "./../../../../models/Daudi/order/Order";
import { OrderContactForm } from "./../../../../models/Daudi/forms/CreateOrder";
import { FuelType } from "./../../../../models/Daudi/fuel/FuelType";
import { OrderFuelConfig } from "./../../../../models/Daudi/order/FuelConfig";
import { ConfigService } from "./../../../../admin/services/core/config.service";
import { Config, emptyConfig } from "./../../../../models/Daudi/omc/Config";
import { Environment } from "./../../../../models/Daudi/omc/Environments";

@Component({
  selector: "app-calculations",
  templateUrl: "./calculations.component.html",
  styleUrls: ["./calculations.component.scss"]
})
export class CalculationsComponent implements OnInit {
  @Input() initData: Order;
  @Output() formResult: {
    [key in FuelType]: OrderFuelConfig
  };
  omcConfig: Config = { ...emptyConfig };
  env: Environment = Environment.sandbox;

  constructor(
    private configService: ConfigService,

  ) {
    //  .pipe(takeUntil(this.comopnentDestroyed))
    //       .subscribe((value) => {
    //         if (value.pmsqtyControl >= 1000 || value.agoqtyControl >= 1000 || value.ikqtyControl >= 1000) {
    //           this.orderform.controls.pmsqtyControl.setErrors(null);
    //           this.orderform.controls.agoqtyControl.setErrors(null);
    //           this.orderform.controls.ikqtyControl.setErrors(null);
    //         }
    //         this.fueltypesArray.forEach((fueltype) => {
    //           this.initData.fuel[fueltype].qty = Number(value[fueltype + "qtyControl"]);
    //           this.initData.fuel[fueltype].priceconfig.price = Number(value[fueltype]);
    //           this.initData.fuel[fueltype].priceconfig.retailprice = this.tempsellingprices[fueltype];
    //           this.initData.fuel[fueltype].priceconfig.minsp = this.activedepot.config.price[fueltype].minPrice;
    //           const decimamlResolution = value[`${fueltype}qtyControl`] >= 10000 ? 4 : 3;
    //           const calculatedpirces = this.deriveprice(this.initData.fuel[fueltype].priceconfig.price, fueltype, decimamlResolution);
    //           this.initData.fuel[fueltype].priceconfig.taxablePrice = calculatedpirces.taxablePrice;
    //           this.initData.fuel[fueltype].priceconfig.nonTaxprice = calculatedpirces.pricewithoutvat;

    //           const totalwithouttax = this.totalswithouttax(this.initData.fuel[fueltype].priceconfig.nonTaxprice, this.initData.fuel[fueltype].qty);
    //           this.initData.fuel[fueltype].priceconfig.nonTaxtotal = totalwithouttax;

    //           // this.initData.fuel[fueltype].priceconfig.total = taxcalculations.taxamount + totalwithouttax;
    //           this.initData.fuel[fueltype].priceconfig.total = this.initData.fuel[fueltype].priceconfig.price * this.initData.fuel[fueltype].qty;

    //           this.initData.fuel[fueltype].priceconfig.taxAmnt = this.initData.fuel[fueltype].priceconfig.total - totalwithouttax;
    //           this.initData.fuel[fueltype].priceconfig.taxableAmnt = totalwithouttax;

    //           this.initData.fuel[fueltype].priceconfig.difference =
    //             this.calculateupmark(this.initData.fuel[fueltype].priceconfig.price, this.initData.fuel[fueltype].priceconfig.retailprice, this.initData.fuel[fueltype].qty);
    //           this.validateandcorrect();
    //         });
    //       });
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

  initordersform() {
    // if (!this.discApproval) {
    //   this.temporder.notifications = {
    //     /**
    //      * Initialise these variables default as false for sandbox environment
    //      */
    //     sms: this.configService.environment.value === "sandbox" ? false : true,
    //     email: this.configService.environment.value === "sandbox" ? false : true
    //   };
    //   /**
    //    * @todo finish min price calculation logic
    //    */
    //   this.fueltypesArray.forEach((fueltype: FuelType) => {
    //     /**
    //      * Make sure that the current selling price is lower than the min selling price for the most recent entry
    //      */
    //     if (this.activedepot.config.price[fueltype].price >= this.activedepot.config.price[fueltype].minPrice) {
    //       this.tempsellingprices[fueltype] = this.activedepot.config.price[fueltype].minPrice;
    //     } else {
    //       this.tempsellingprices[fueltype] = this.activedepot.config.price[fueltype].price;
    //       this.notificationService.notify({
    //         alert_type: "notify",
    //         duration: 20000,
    //         title: "Invalid Prices",
    //         body: `The current selling price for ${fueltype} is lower than the Min selling price, hence the Min selling price has been used`
    //       });
    //     }
    //     this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
    //     this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.activedepot.config.price[fueltype].minPrice), Validators.required]));
    //   });
    // } else {
    //   this.fueltypesArray.forEach((fueltype) => {
    //     this.orderform.controls[fueltype].setValue(this.temporder.fuel[fueltype].priceconfig.price = this.tempsellingprices[fueltype]);
    //     this.orderform.controls[fueltype].setValidators(Validators.compose([Validators.min(this.activedepot.config.price[fueltype].price), Validators.required]));
    //   });
    // }
  }
  /**
   * uses the simple formula :
   * PricewithoutVAT=OriginalPrice + (0.08*VATExempt)/1.08, simplified
   * Decimal resolution depends on the qty, as above 10000l the point affects significant amount, but at the same time we
   * Dont want decimals at lower quantities
   */
  deriveprice(priceinclusivevat: number, fueltype: FuelType, decimalResolution: number): { pricewithoutvat: number, amountdeducted: number, taxablePrice: number } {
    const pricewithoutvat = Number(((priceinclusivevat + (0.08 * this.omcConfig.taxExempt[this.env][fueltype].amount)) / 1.08).toFixed(decimalResolution));
    const amountdeducted = priceinclusivevat - pricewithoutvat;
    const taxablePrice = Number((pricewithoutvat - this.omcConfig.taxExempt[this.env][fueltype].amount).toFixed(decimalResolution));
    return { pricewithoutvat, amountdeducted, taxablePrice };
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
