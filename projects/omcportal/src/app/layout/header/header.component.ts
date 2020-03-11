import { Component, OnDestroy, OnInit } from '@angular/core';
import { APPCONFIG } from 'app/config';
import { Admin, emptyadmin } from 'app/models/Daudi/admin/Admin';
import { Depot, emptydepot } from 'app/models/Daudi/depot/Depot';
import { DepotConfig, emptyDepotConfig } from 'app/models/Daudi/depot/DepotConfig';
import { FuelNamesArray } from 'app/models/Daudi/fuel/FuelType';
import { OrderStageIds } from 'app/models/Daudi/order/OrderStages';
import { TruckStageNames } from 'app/models/Daudi/order/truck/TruckStages';
import { AdminService } from 'app/services/core/admin.service';
import { CoreService } from 'app/services/core/core.service';
import { StatusService } from 'app/services/core/status.service';
import { ReplaySubject } from 'rxjs';
import { skipWhile, takeUntil } from 'rxjs/operators';
import { TooltipPosition } from '@angular/material/tooltip';

@Component({
  selector: 'my-app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})

export class AppHeaderComponent implements OnInit, OnDestroy {
  position: TooltipPosition = 'after';
  position1: TooltipPosition = 'before';
  position2: TooltipPosition = 'above';
  public AppConfig: any;
  isLoggedIn: boolean;
  loggedInUser: string;
  hide = true;
  firstload = true;
  // fuelprices: FuelPrices = {};
  allowsandbox = true;
  adminLevel: number = null;
  activedepot: { depot: Depot, config: DepotConfig; } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };
  currentuser: Admin = { ...emptyadmin };
  connectionStatus: boolean;
  alldepots: Depot[] = [];
  privateDepots: Depot[] = [];
  kpcDepots: Depot[] = [];
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
      .pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Depot[]) => {
        this.alldepots = alldepots;
        this.kpcDepots = alldepots.filter(depot => {
          return !depot.config.private;
        });
        this.privateDepots = alldepots.filter(depot => {
          return depot.config.private;
        });
      });
    this.core.loaders.depots.subscribe(loading => {
      this.loadingDepots = loading;
    });
    OrderStageIds.forEach(stage => {
      this.core.orders[stage]
        .pipe(takeUntil(this.comopnentDestroyed))
        .subscribe(orders => {
          this.orderscount[stage] = orders.length;
          if (stage === 4) {
            this.truckscount = {
              1: 0,
              2: 0,
              3: 0,
              4: 0
            };
            orders.map(order => {
              this.truckscount[order.truck.stage] += 1;
            });
          }
        });
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

  changeactivedepot() {
    this.core.changeactivedepot(this.activedepot.depot);
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
