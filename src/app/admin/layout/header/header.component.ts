import { Component, OnDestroy, OnInit } from "@angular/core";
import { APPCONFIG } from "../../config";
import { Router } from "@angular/router";
//interfaces
import { AngularFireAuth } from "@angular/fire/auth";
import { Depot_, emptydepot } from "../../../models/Depot";
import { AdminsService } from "../../services/admins.service";
import { DepotsService } from "../../services/depots.service";
import { Admin_, emptyadmin } from "../../../models/Admin";
import { fueltypesArray } from "../../../models/Fueltypes";
import { OrdersService } from "../../services/orders.service";
import { orderStagesarray } from "../../../models/Order";
import { truckStagesarray } from "../../../models/Truck";
import { TrucksService } from "../../services/trucks.service";
import { PricesService } from "../../services/prices.service";
import { fuelTypes } from "../../../models/universal";
import { Price } from "../../../models/Price";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";


@Component({
  selector: "my-app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})

export class AppHeaderComponent implements OnInit, OnDestroy {
  position = "after";
  position1 = "before";
  position2 = "above";
  public AppConfig: any;
  isLoggedIn: boolean;
  loggedInUser: string;
  hide: boolean = true;
  firstload: boolean = true;
  // fuelprices: FuelPrices = {};

  adminLevel: number = null;
  activedepot: Depot_ = Object.assign({}, emptydepot);
  currentuser: Admin_ = { ...emptyadmin };
  connectionStatus: boolean;
  alldepots: Array<Depot_>;
  orderscount = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0
  };
  truckscount = {
    1: 0,
    2: 0,
    3: 0,
    4: 0
  };

  avgprices: {
    [key in fuelTypes]: {
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

  fueltypesArray = fueltypesArray;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private router: Router,
    private afAuth: AngularFireAuth,
    private orderservice: OrdersService,
    private truckservice: TrucksService,
    private adminservice: AdminsService,
    private depotservice: DepotsService,
    private priceservice: PricesService) {
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe((depot: Depot_) => {
      this.activedepot = depot;
    });
    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Array<Depot_>) => {
      this.alldepots = alldepots;
    });
    orderStagesarray.forEach(stage => {
      this.orderservice.orders[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(orders => this.orderscount[stage] = orders.length);
    });
    truckStagesarray.forEach(stage => {
      this.truckservice.trucks[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(trucks => this.truckscount[stage] = trucks.length);
    });
    this.adminservice.observableuserdata.pipe(takeUntil(this.comopnentDestroyed)).subscribe(admin => {
      this.currentuser = admin;
    });
    this.adminservice.connectionStatus.pipe(takeUntil(this.comopnentDestroyed)).subscribe(status => {
      this.connectionStatus = status;
    });
    fueltypesArray.forEach(fueltyp => {
      this.priceservice.avgprices[fueltyp].total.pipe(takeUntil(this.comopnentDestroyed)).subscribe(total => {
        this.avgprices[fueltyp].total = total;
      });
      this.priceservice.avgprices[fueltyp].prices.pipe(takeUntil(this.comopnentDestroyed)).subscribe(prices => {
        this.avgprices[fueltyp].prices = prices;
      });
    });
  }

  changeactivedepot(depot: Depot_) {
    this.depotservice.changeactivedepot(depot);
  }

  ngOnInit() {
    this.AppConfig = APPCONFIG;
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  onLogoutClick() {
    this.adminservice.logoutsequence();
  }


}
