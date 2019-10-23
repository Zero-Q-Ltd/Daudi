import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MatTableDataSource } from "@angular/material";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { AngularFirestore } from "@angular/fire/firestore";
import { NotificationService } from "../../shared/services/notification.service";
import { ConfirmDialogComponent } from "../confirm-dialog/confirm-dialog.component";
import { fuelTypes } from "../../models/universal";
import { Price } from "../../models/Price";
import { Depot, emptydepot } from "../../models/Depot";
import { emptytaxconfig, taxconfig } from "../../models/Taxconfig";
import { AdminsService } from "../services/admins.service";
import { PricesService } from "../services/prices.service";
import { DepotsService } from "../services/depots.service";
import { fueltypesArray } from "../../models/Fueltypes";
import { Admin, emptyadmin } from "../../models/Admin";
import { AvgPrice } from "../../models/AvgPrice";
import { Omc } from "../../models/Omc";
import { OmcService } from "../services/omc.service";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "edit-price",
  templateUrl: "./edit-price.component.html",
  styleUrls: ["./edit-price.component.scss"]
})

export class EditPriceComponent implements OnInit, OnDestroy {
  position = "above";
  position2 = "left";
  position3 = "right";

  avgprices: {
    [key in fuelTypes]: {
      total: number,
      prices: Array<AvgPrice>
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
    pms: new FormControl("", [Validators.required, Validators.min(40)]),
    ago: new FormControl("", [Validators.required, Validators.min(40)]),
    ik: new FormControl("", [Validators.required, Validators.min(40)]),
  });
  taxconfigform: FormGroup = new FormGroup({
    pms: new FormControl("", []),
    ago: new FormControl("", []),
    ik: new FormControl("", [])
  });
  fueltypesArray = fueltypesArray;

  saving = false;
  depotsdataSource = new MatTableDataSource<Depot>();
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  userdata: Admin = Object.assign({}, { ...emptyadmin });
  omcs: Array<Omc> = [];
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  selectedOMC: Omc;

  constructor(
    private dialog: MatDialog,
    private db: AngularFirestore,
    private depotservice: DepotsService,
    private notificationService: NotificationService,
    private adminservice: AdminsService,
    private priceservice: PricesService,
    private omcservice: OmcService) {

    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe((value) => {
      this.depotsdataSource.data = value.filter((n) => n);
    });
    this.omcservice.omcs.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
      this.omcs = value;
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

  displayFn(omc?: Omc): string | undefined {
    return omc ? omc.name : undefined;
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
          this.activedepot.currentpriceconfig[fueltype].price = tempprice.price;
          this.activedepot.currentpriceconfig[fueltype].user = tempprice.user;
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

  addavgprice(fueltype: "pms" | "ago" | "ik") {
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

