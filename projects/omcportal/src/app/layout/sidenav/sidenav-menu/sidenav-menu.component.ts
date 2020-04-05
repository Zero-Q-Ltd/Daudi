import {Component, OnDestroy} from "@angular/core";
import {Depot, emptydepot} from "app/models/Daudi/depot/Depot";
import {OrderStageIds} from "app/models/Daudi/order/OrderStages";
import {TruckStageNames} from "app/models/Daudi/order/truck/TruckStages";
import {CoreService} from "app/services/core/core.service";
import {DepotService} from "app/services/core/depot.service";
import {OrdersService} from "app/services/orders.service";
import {ReplaySubject} from "rxjs";
import {takeUntil} from "rxjs/operators";

@Component({
  selector: "my-app-sidenav-menu",
  styles: [],
  templateUrl: "./sidenav-menu.component.html"
})

export class AppSidenavMenuComponent implements OnDestroy {
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
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  alldepots: Depot[];
  activedepot: Depot = Object.assign({}, emptydepot);

  constructor(
    private orderservice: OrdersService,
    private core: CoreService,
    private depotservice: DepotService) {
    OrderStageIds.forEach(stage => {
      this.core.orders[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(orders => this.orderscount[stage] = orders.length);
    });
    TruckStageNames.forEach(stage => {
      // this.truckservice.trucks[stage].pipe(takeUntil(this.comopnentDestroyed)).subscribe(trucks => this.truckscount[stage] = trucks.length);
    });
    this.core.depots.pipe(takeUntil(this.comopnentDestroyed)).subscribe((alldepots: Depot[]) => {
      this.alldepots = alldepots;
    });
    this.core.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe((depot) => {
      // this.activedepot = depot;
    });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  changeactivedepot(depot: Depot) {
    this.core.changeactivedepot(depot);

  }

}
