import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource, MatSort } from "@angular/material";
import { takeUntil } from "rxjs/operators";
import { Depot, emptydepot } from "../../models/Daudi/depot/Depot";
import { DepotService } from "../services/core/depot.service";
import { ReplaySubject } from "rxjs";
import { FuelNamesArray } from "../../models/Daudi/fuel/FuelType";
import { DepotConfig, emptyDepotConfig } from "../../models/Daudi/depot/DepotConfig";

@Component({
  selector: "app-price-comparison",
  templateUrl: "./price-comparison.component.html",
  styleUrls: ["./price-comparison.component.scss"]
})
export class PriceComparisonComponent implements OnInit {
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  depotsdataSource = new MatTableDataSource<Depot>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  fueltypesArray = FuelNamesArray;
  priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
  activedepot: { depot: Depot, config: DepotConfig } = { depot: { ...emptydepot }, config: { ...emptyDepotConfig } };

  constructor(
    private depotService: DepotService,

  ) {

    this.depotService.alldepots
      .pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((value) => {
        this.depotsdataSource.data = value.filter((n) => n);
      });
  }

  ngOnInit() {
  }
  ngAfterViewInit() {
    this.depotsdataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }
  unsubscribeAll() {

  }


  applyFilter(filterValue: string) {
    this.depotsdataSource.filter = filterValue.trim().toLowerCase();
  }
}
