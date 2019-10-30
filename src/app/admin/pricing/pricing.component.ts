import { Component, OnDestroy, OnInit } from "@angular/core";
import { Types } from "../../models/fuel/fuelTypes";
import { Price } from "../../models/depot/Price";
import { Depot, emptydepot } from "../../models/depot/Depot";
import { emptytaxconfig, taxconfig } from "../../models/FuelConfig";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { fueltypesArray } from "../../models/fuel/Types";
import { MatDialog } from "@angular/material";
import { Admin, emptyadmin } from "../../models/admin/Admin";
import { AngularFirestore } from "@angular/fire/firestore";
import { DepotsService } from "../services/core/depots.service";
import { NotificationService } from "../../shared/services/notification.service";
import { AdminsService } from "../services/core/admins.service";
import { PricesService } from "../services/prices.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-pricing",
  templateUrl: "./pricing.component.html",
  styleUrls: ["./pricing.component.scss"]
})
export class PricingComponent implements OnInit, OnDestroy {
  position = "above";
  position2 = "left";
  position3 = "right";

  avgprices: {
    [key in Types]: {
      total: number,
      prices: Array<Price>
    }
  } = {
      pms: {
        total: 0,
        prices: []
      },
      ago: {
        total: 0,
        prices: []
      },
      ik: {
        total: 0,
        prices: []
      }
    };
  activedepot: Depot = Object.assign({}, emptydepot);
  taxexempt: taxconfig = emptytaxconfig;
  spPricesform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });

  avgpricesform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });
  taxconfigform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });
  fueltypesArray = fueltypesArray;

  saving = false;
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  userdata: Admin = Object.assign({}, emptyadmin);
  connectionStatus: boolean;
  alldepots: Array<Depot>;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private dialog: MatDialog,
    private db: AngularFirestore,
    private depotservice: DepotsService,
    private notificationService: NotificationService,
    private adminservice: AdminsService,
    private priceservice: PricesService) {

    this.adminservice.connectionStatus.pipe(takeUntil(this.comopnentDestroyed)).subscribe(status => {
      this.connectionStatus = status;
    });
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depot => {
      this.activedepot = depot;
      this.spPricesform.controls.pms.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.pms.price)]));
      this.spPricesform.controls.ago.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.ago.price)]));
      this.spPricesform.controls.ik.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.ik.price)]));
      /**
       * Olny fetch the avg prices after the active depot has been asigned, hence ignore the first value initializes in the Replaysubject
       */
      if (!depot.Name) {
        return;
      }
      this.taxexempt = depot.taxconfig;
      this.taxconfigform.disable();

      fueltypesArray.forEach(fueltyp => {
        this.priceservice.avgprices[fueltyp].total.pipe(takeUntil(this.comopnentDestroyed)).subscribe(total => {
          this.avgprices[fueltyp].total = total;
        });
        this.priceservice.avgprices[fueltyp].prices.pipe(takeUntil(this.comopnentDestroyed)).subscribe(prices => {
          this.avgprices[fueltyp].prices = prices;
        });
      });
    });
    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Array<Depot>) => {
      this.alldepots = alldepots;
    });
  }

  ngOnInit() {
  }

  changeactivedepot(depot: Depot) {
    this.depotservice.changeactivedepot(depot);
  }

  addprice(fueltype: "pms" | "ago" | "ik") {

    if (this.spPricesform.controls[fueltype].valid) {
      this.saving = true;
      const dialogRef = this.dialog.open(ConfirmDialogComponent,
        {
          role: "dialog",
          data: `Are you sure you want to set ${this.spPricesform.controls[fueltype].value} as the current ${fueltype} price in ${this.activedepot.Name}?`
        });
      dialogRef.afterClosed().pipe(takeUntil(this.comopnentDestroyed)).subscribe(result => {
        if (result) {
          const batchaction = this.db.firestore.batch();
          const tempprice: Price = {
            user: this.adminservice.createuserobject(),
            price: this.spPricesform.controls[fueltype].value,
            fueltytype: fueltype,
            Id: null
          };
          batchaction.set(this.priceservice.createprice(), tempprice);
          this.activedepot.price[fueltype].price = tempprice.price;
          this.activedepot.price[fueltype].user = tempprice.user;
          batchaction.update(this.depotservice.updatedepot(), this.activedepot);
          batchaction.commit().then(res => {
            this.saving = false;
            this.notificationService.notify({
              body: `${fueltype} in ${this.activedepot.Name} successfully changed`,
              title: `Success`,
              alert_type: "success"
            });
          });
        } else {
          this.saving = false;
          this.notificationService.notify({
            body: `Changes discarded`,
            title: "",
            alert_type: "warning"
          });
        }
      });
    }
  }


  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  addavgprice(fueltype: "pms" | "ago" | "ik") {
    this.saving = true;
    console.log(this.avgpricesform.value);
    if (this.avgpricesform.controls[fueltype].valid) {
      const batchaction = this.db.firestore.batch();
      const tempprice: Price = {
        user: this.adminservice.createuserobject(),
        price: this.avgpricesform.controls[fueltype].value,
        fueltytype: fueltype,
        Id: null
      };
      batchaction.set(this.priceservice.createavgprice(), tempprice);

      batchaction.commit().then(res => {
        this.saving = false;
        this.notificationService.notify({
          body: `${fueltype} in ${this.activedepot.Name} Added`,
          title: `Success`,
          alert_type: "success"
        });
      });
      // this.firestore
    }
  }

  onLogoutClick() {
    this.adminservice.logoutsequence();
  }

  deleteavg(price: Price) {
    this.saving = true;
    this.priceservice.deleteavgprice(price.Id).delete().then(res => {
      this.saving = false;
      this.notificationService.notify({
        body: `${price.fueltytype} in ${this.activedepot.Name} Deleted`,
        alert_type: "success",
        title: `Success`
      });
    });
  }

}

