import { Component, OnDestroy, OnInit } from "@angular/core";
import { MatSlideToggleChange } from "@angular/material";
import { ReplaySubject } from "rxjs";
import { skipWhile, takeUntil } from "rxjs/operators";
import { Admin, emptyadmin } from "../../../models/Daudi/admin/Admin";
import { Depot, emptydepot } from "../../../models/Daudi/depot/Depot";
import { DepotConfig, emptyDepotConfig } from "../../../models/Daudi/depot/DepotConfig";
import { FuelNamesArray } from "../../../models/Daudi/fuel/FuelType";
import { Environment } from "../../../models/Daudi/omc/Environments";
import { OrderStageIds } from "../../../models/Daudi/order/OrderStages";
import { TruckStageNames } from "../../../models/Daudi/order/truck/TruckStages";
import { APPCONFIG } from "../../config";
import { AdminService } from "../../services/core/admin.service";
import { CoreService } from "../../services/core/core.service";
import { StatusService } from "../../services/core/status.service";

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
  loadingDepots = true;
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
    this.core.loaders.depots.subscribe(loading => {
      this.loadingDepots = loading;
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
