import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatTableDataSource } from "@angular/material";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Admin, emptyadmin } from "../../models/Daudi/admin/Admin";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";
import { Price } from "../../models/Daudi/depot/Price";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { emptyConfig, AdminConfig } from "../../models/Daudi/omc/Config";
import { OMC } from "../../models/Daudi/omc/OMC";
import { AvgPrice } from "../../models/Daudi/price/AvgPrice";
import { NotificationService } from "../../shared/services/notification.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { AdminService } from "../services/core/admin.service";
import { CoreService } from "../services/core/core.service";
import { OmcService } from "../services/core/omc.service";
import { PricesService } from "../services/prices.service";

@Component({
  selector: "edit-price",
  templateUrl: "./edit-price.component.html",
  styleUrls: ["./edit-price.component.scss"]
})

export class EditPriceComponent implements OnInit, OnDestroy {
  position = "above";
  position2 = "left";
  position3 = "right";

  activedepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
  spPricesform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });

  avgpricesform: FormGroup = new FormGroup({
    pms: new FormControl("", [Validators.required, Validators.min(40)]),
    ago: new FormControl("", [Validators.required, Validators.min(40)]),
    ik: new FormControl("", [Validators.required, Validators.min(40)]),
  });
  taxconfigform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });
  fueltypesArray = FuelNamesArray;
  saving = false;
  depotsdataSource = new MatTableDataSource<Depot>();
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  userdata: Admin = Object.assign({}, { ...emptyadmin });
  omcs: Array<OMC> = [];
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  selectedOMC: OMC;

  currentOmcConfig: AdminConfig = { ...emptyConfig };

  avgprices: {
    [key in FuelType]: {
      total: BehaviorSubject<number>,
      avg: BehaviorSubject<number>,
      prices: BehaviorSubject<Array<Price>>
    }
  } = {
      pms: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      },
      ago: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      },
      ik: {
        total: new BehaviorSubject<number>(0),
        avg: new BehaviorSubject<number>(0),
        prices: new BehaviorSubject<Array<Price>>([])
      }
    };
  constructor(
    private dialog: MatDialog,
    private db: AngularFirestore,
    private notificationService: NotificationService,
    private adminservice: AdminService,
    private priceservice: PricesService,
    private core: CoreService,

    private omcservice: OmcService) {

    this.core.depots
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        this.depotsdataSource.data = value.filter((n) => n);
      });
    this.core.omcs
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(value => {
        this.omcs = value;
      });

    this.core.adminConfig
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(config => {
        this.currentOmcConfig = config;
      });

    this.core.activedepot
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(depot => {
        // this.activedepot = depot;
        // this.spPricesform.controls.pms.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.pms.price)]));
        // this.spPricesform.controls.ago.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.ago.price)]));
        // this.spPricesform.controls.ik.setValidators(Validators.compose([Validators.min(this.activedepot.minpriceconfig.ik.price)]));
        this.activedepot = depot;
        this.taxconfigform.disable();
        // this.fueltypesArray.forEach(fueltyp => {
        //   this.avgprices[fueltyp].total
        //     .pipe(takeUntil(this.comopnentDestroyed))
        //     .subscribe(total => {
        //       this.avgprices[fueltyp].total = total;
        //     });
        //   this.avgprices[fueltyp].prices
        //     .pipe(takeUntil(this.comopnentDestroyed))
        //     .subscribe(prices => {
        //       this.avgprices[fueltyp].prices = prices;
        //     });
        // });

      });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  ngOnInit() {
  }

  applyFilter(filterValue: string) {
    this.depotsdataSource.filter = filterValue.trim().toLowerCase();
  }

  displayFn(omc?: OMC): string | undefined {
    return omc ? omc.name : undefined;
  }

  addprice(fueltype: FuelType) {

    if (this.spPricesform.controls[fueltype].valid) {
      this.saving = true;
      const dialogRef = this.dialog.open(ConfirmDialogComponent,
        {
          role: "dialog",
          data: `Are you sure you want to set ${this.spPricesform.controls[fueltype].value} as the current ${fueltype} price in ${this.activedepot.depot.Name}?`
        });
      dialogRef.afterClosed()
        .pipe(takeUntil(this.comopnentDestroyed))
        .subscribe(result => {
          if (result) {
            const batchaction = this.db.firestore.batch();
            const tempprice: Price = {
              user: this.adminservice.createuserobject(),
              price: this.spPricesform.controls[fueltype].value,
              fueltytype: fueltype,
              depotId: this.activedepot.depot.Id,
              Id: null
            };
            // batchaction.set(this.priceservice.createprice(), tempprice);
            // this.activedepot.price[fueltype].price = tempprice.price;
            // this.activedepot.price[fueltype].user = tempprice.user;
            // batchaction.update(this.depotservice.updatedepot(), this.activedepot);
            // batchaction.commit().then(res => {
            //   this.saving = false;
            //   this.notificationService.notify({
            //     body: `${fueltype} in ${this.activedepot.Name} successfully changed`,
            //     title: `Success`,
            //     alert_type: "success"
            //   });
            // });
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

  addavgprice(fueltype: FuelType) {
    this.saving = true;
    console.log(this.avgpricesform.value);
    if (!this.selectedOMC) {
      this.saving = false;
      return this.notificationService.notify({
        body: `Please select OMC first`,
        alert_type: "error",
        title: `Error`
      });
    } else {
      if (this.avgpricesform.controls[fueltype].valid) {

        const batchaction = this.db.firestore.batch();
        const tempprice: AvgPrice = {
          user: this.adminservice.createuserobject(),
          price: this.avgpricesform.controls[fueltype].value,
          fueltytype: fueltype,
          Id: null,
          omcId: this.selectedOMC.Id
        };
        batchaction.set(this.priceservice.createavgprice(this.core.currentOmc.value.Id), tempprice);

        batchaction.commit().then(res => {
          this.saving = false;
          this.notificationService.notify({
            body: `${fueltype} in ${this.activedepot.depot.Name} Added`,
            title: `Success`,
            alert_type: "success"
          });
        });
        // this.firestore
      } else {
        this.saving = false;
        this.notificationService.notify({
          body: `Ivalid ${fueltype} Price`,
          alert_type: "error",
          title: `Error`
        });
      }
    }
  }

  deleteavg(price: Price) {
    this.saving = true;
    this.priceservice.deleteavgprice(this.core.currentOmc.value.Id, price.Id).delete().then(res => {
      this.saving = false;
      this.notificationService.notify({
        body: `${price.fueltytype} in ${this.activedepot.depot.Name} Deleted`,
        alert_type: "success",
        title: `Success`
      });
    });
  }

}

