import { Component, OnInit, OnDestroy } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { OrderService } from "projects/home/src/app/services/order.service";
import { ReplaySubject } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { emptyorder, Order } from "projects/home/src/app/models/order/Order";
import { toObject } from "projects/home/src/app/models/utils/SnapshotUtils";
import { deepCopy } from "projects/home/src/app/models/utils/deepCopy";

@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  styleUrls: ["./orders.component.css"]
})
export class OrdersComponent implements OnInit, OnDestroy {
  loading = true;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  order: Order = deepCopy(emptyorder);

  constructor(
    private ordersService: OrderService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.params
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe(routeData => {
        if (!routeData.id) {
          this.router.navigate(["/"]);
        }
        this.ordersService
          .getOrder(routeData.id)
          .get()
          .then(res => {
            this.order = toObject(emptyorder, res.docs[0]);
            // console.log(this.order);
          });
      });
  }

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
  }
}
