import { Component, OnDestroy, OnInit } from "@angular/core";
import { APPCONFIG } from "../../config";
import { Router } from "@angular/router";
// interfaces
import { AngularFireAuth } from "@angular/fire/auth";
import { Depot, emptydepot } from "../../../models/depot/Depot";
import { AdminService } from "../../services/core/admin.service";
import { DepotService } from "../../services/core/depot.service";
import { Admin, emptyadmin } from "../../../models/admin/Admin";
import { fueltypesArray } from "../../../models/fuel/Types";
import { OrdersService } from "../../services/orders.service";
import { orderStagesarray } from "../../../models/order/Order";
import { truckStagesarray } from "../../../models/order/Truck";
import { PricesService } from "../../services/prices.service";
import { Types } from "../../../models/fuel/fuelTypes";
import { Price } from "../../../models/depot/Price";
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
  hide = true;
  firstload = true;
  // fuelprices: FuelPrices = {};

  adminLevel: number = null;
  activedepot: Depot = Object.assign({}, emptydepot);
  currentuser: Admin = { ...emptyadmin };
  connectionStatus: boolean;
  alldepots: Array<Depot>;
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

  fueltypesArray = fueltypesArray;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(private router: Router,
              private afAuth: AngularFireAuth,
              private orderservice: OrdersService,
              private adminservice: AdminService,
              private depotservice: DepotService,
              private priceservice: PricesService) {
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe((depot: Depot) => {
      this.activedepot = depot;
    });
    this.depotservice.alldepots.pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Array<Depot>) => {
      this.alldepots = alldepots;
    });
    orderStagesarray.forEach(stage => {
      this.orderservice.orders[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(orders => this.orderscount[stage] = orders.length);
    });
    truckStagesarray.forEach(stage => {
      // this.truckservice.trucks[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(trucks => this.truckscount[stage] = trucks.length);
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

  changeactivedepot(depot: Depot) {
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
