import { Component, OnDestroy, OnInit, EventEmitter } from "@angular/core";
import { APPCONFIG } from "../../config";
import { Router } from "@angular/router";
// interfaces
import { AngularFireAuth } from "@angular/fire/auth";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { AdminService } from "../../services/core/admin.service";
import { DepotService } from "../../services/core/depot.service";
import { Admin, emptyadmin } from "../../../models/Daudi/admin/Admin";
import { OrdersService } from "../../services/orders.service";
import { PricesService } from "../../services/prices.service";
import { FuelType, FuelNamesArray } from "../../../models/Daudi/fuel/FuelType";
import { Price } from "../../../models/Daudi/depot/Price";
import { ReplaySubject } from "rxjs";
import { takeUntil, skipWhile } from "rxjs/operators";
import { StatusService } from "../../services/core/status.service";
import { Config, emptyConfig } from "../../../models/Daudi/omc/Config";
import { MatSlideToggleChange } from "@angular/material";
import { Environment } from "../../../models/Daudi/omc/Environments";
import { ConfigService } from "../../services/core/config.service";
import { DepotConfig, emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { OrderStageIds } from "../../../models/Daudi/order/OrderStages";
import { TruckStageNames } from "../../../models/Daudi/order/TruckStages";
import { CoreService } from "../../services/core/core.service";

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
  allowsandbox = true;
  adminLevel: number = null;
  activedepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
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

  fueltypesArray = FuelNamesArray;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  environment: Environment;
  constructor(
    private adminservice: AdminService,
    private core: CoreService,
    private status: StatusService) {
    this.core.activedepot.pipe(
      skipWhile(t => !t.depot.Id),
      takeUntil(this.comopnentDestroyed))
      .subscribe((depot) => {
        this.activedepot = depot;
      });
    this.core.depots
      .pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Array<Depot>) => {
        this.alldepots = alldepots;
      });
    OrderStageIds.forEach(stage => {
      this.core.orders[stage]
        .pipe(takeUntil(this.comopnentDestroyed))
        .subscribe(orders => this.orderscount[stage] = orders.length);
    });
    TruckStageNames.forEach(stage => {
      // this.truckservice.trucks[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(trucks => this.truckscount[stage] = trucks.length);
    });
    this.adminservice.observableuserdata
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(admin => {
        this.currentuser = admin;
      });
    this.status.connectionStatus
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(statuss => {
        this.connectionStatus = statuss;
      });

  }

  changeactivedepot(depot: Depot) {
    this.core.changeactivedepot(depot);
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
  changeEnvironment(change: MatSlideToggleChange) {
    this.environment = change.checked ? Environment.sandbox : Environment.live;
    this.core.environment.next(this.environment);
    const tempappconfig = { ...APPCONFIG };
    tempappconfig.colorOption = change.checked ? "2" : "32";
    this.AppConfig = { ...tempappconfig };
  }

}
