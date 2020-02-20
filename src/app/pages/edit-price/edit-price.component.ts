import { Component, OnDestroy, OnInit } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialog, MatTableDataSource } from "@angular/material";
import { ConfirmDialogComponent } from "app/components/confirm-dialog/confirm-dialog.component";
import { newStock, Stock } from "app/models/Daudi/omc/Stock";
import { AdminService } from "app/services/core/admin.service";
import { CoreService } from "app/services/core/core.service";
import { OmcService } from "app/services/core/omc.service";
import { PricesService } from "app/services/prices.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { Admin, emptyadmin } from "../../models/Daudi/admin/Admin";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";
import { Price } from "../../models/Daudi/depot/Price";
import { FuelNamesArray, FuelType } from "../../models/Daudi/fuel/FuelType";
import { OMC } from "../../models/Daudi/omc/OMC";
import { AvgPrice } from "../../models/Daudi/price/AvgPrice";
import { NotificationService } from "../../shared/services/notification.service";
import { DepotService } from 'app/services/core/depot.service';
import { TaxPrice } from 'app/models/Daudi/price/TaxPrice';

@Component({
  selector: 'edit-price',
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

  minpricesForm: FormGroup = new FormGroup({
    pms: new FormControl("", [Validators.required, Validators.min(40)]),
    ago: new FormControl("", [Validators.required, Validators.min(40)]),
    ik: new FormControl("", [Validators.required, Validators.min(40)]),
  });
  taxconfigform: FormGroup = new FormGroup({
    pms: new FormControl("", [Validators.required, Validators.min(20)]),
    ago: new FormControl("", [Validators.required, Validators.min(20)]),
    ik: new FormControl("", [Validators.required, Validators.min(20)])
  });
  fueltypesArray = FuelNamesArray;
  saving = false;
  depotsdataSource = new MatTableDataSource<Depot>();
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  userdata: Admin = Object.assign({}, { ...emptyadmin });
  omcs: OMC[] = [];
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  selectedOMC: OMC;

  stock: Stock = { ...newStock() };

  avgprices: {
    [key in FuelType]: {
      total: number,
      avg: number,
      prices: Price[]
    }
  } = {
      pms: {
        total: 0,
        avg: 0,
        prices: []
      },
      ago: {
        total: 0,
        avg: 0,
        prices: []
      },
      ik: {
        total: 0,
        avg: 0,
        prices: []
      }
    };

  constructor(
    private dialog: MatDialog,
    private db: AngularFirestore,
    private notificationService: NotificationService,
    private adminservice: AdminService,
    private priceservice: PricesService,
    private core: CoreService,
    private depotService: DepotService,
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

    this.core.stock
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(stock => {
        this.stock = stock;
        this.taxconfigform.setValue({
          pms: stock.taxExempt.pms,
          ago: stock.taxExempt.ago,
          ik: stock.taxExempt.ik
        })
      });

    this.core.activedepot
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(depot => {
        this.activedepot = depot;
        this.fueltypesArray.forEach(fueltyp => {
          this.spPricesform.controls[fueltyp]
            .setValidators(Validators.compose([Validators.min(this.activedepot.config.price[fueltyp].minPrice)]));
          console.log(this.avgpricesform[fueltyp])
          // this.avgpricesform[fueltyp].valuechanges
          //   .pipe(takeUntil(this.comopnentDestroyed))
          //   .subscribe(total => {
          //     // this.avgprices[fueltyp].total = total;
          //   });
        });

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

  saveSP(fueltype: FuelType) {

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
            const batch = this.db.firestore.batch();
            const tempPrice: Price = {
              user: this.adminservice.createUserObject(),
              price: +this.spPricesform.controls[fueltype].value,
              fueltytype: fueltype,
              depotId: this.activedepot.depot.Id,
              Id: this.core.createId()
            };
            batch.set(this.priceservice.priceCollection(this.core.omcId).doc(tempPrice.Id), tempPrice);
            this.activedepot.config.price[fueltype] = {
              minPrice: this.activedepot.config.price[fueltype].minPrice,
              price: +this.spPricesform.controls[fueltype].value,
              user: this.adminservice.createUserObject()
            }
            batch.update(this.depotService.depotConfigDoc(this.core.omcId, this.activedepot.depot.Id), this.activedepot.config);
            batch.commit().then(res => {
              this.saving = false;
              this.notificationService.notify({
                body: `${fueltype} in ${this.activedepot.depot.Name} successfully changed`,
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

  saveMinSp(fueltype: FuelType) {

    if (this.minpricesForm.controls[fueltype].valid) {
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
            const batch = this.db.firestore.batch();
            const tempPrice: Price = {
              user: this.adminservice.createUserObject(),
              price: +this.minpricesForm.controls[fueltype].value,
              fueltytype: fueltype,
              depotId: this.activedepot.depot.Id,
              Id: this.core.createId()
            };
            batch.set(this.priceservice.minPriceCollection(this.core.omcId).doc(tempPrice.Id), tempPrice);
            this.activedepot.config.price[fueltype] = {
              minPrice: +this.minpricesForm.controls[fueltype].value,
              price: this.activedepot.config.price[fueltype].price,
              user: this.adminservice.createUserObject()
            }
            batch.update(this.depotService.depotConfigDoc(this.core.omcId, this.activedepot.depot.Id), this.activedepot.config);
            batch.commit().then(res => {
              this.saving = false;
              this.notificationService.notify({
                body: `${fueltype} in ${this.activedepot.depot.Name} successfully changed`,
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
          user: this.adminservice.createUserObject(),
          price: this.avgpricesform.controls[fueltype].value,
          fueltytype: fueltype,
          Id: this.core.createId(),
          depotId: this.activedepot.depot.Id,
          omcId: this.selectedOMC.Id
        };
        batchaction.set(this.priceservice.avgPricesCollection(this.core.currentOmc.value.Id).doc(tempprice.Id), tempprice);

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
  addTaxPrice(fueltype: FuelType) {
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
        const tempprice: TaxPrice = {
          user: this.adminservice.createUserObject(),
          price: this.avgpricesform.controls[fueltype].value,
          fueltytype: fueltype,
          Id: this.core.createId(),
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

