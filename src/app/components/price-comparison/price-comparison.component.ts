import {Component, OnInit, ViewChild} from "@angular/core";
import {MatSort, MatTableDataSource} from "@angular/material";
import {takeUntil} from "rxjs/operators";
import {Depot, emptydepot} from "../../models/Daudi/depot/Depot";
import {BehaviorSubject, ReplaySubject} from "rxjs";
import {FuelNamesArray, FuelType} from "../../models/Daudi/fuel/FuelType";
import {DepotConfig, emptyDepotConfig} from "../../models/Daudi/depot/DepotConfig";
import {CoreService} from "../services/core/core.service";
import {Price} from "../../models/Daudi/depot/Price";

@Component({
    selector: "app-price-comparison",
    templateUrl: "./price-comparison.component.html",
    styleUrls: ["./price-comparison.component.scss"]
})
export class PriceComparisonComponent implements OnInit {
    @ViewChild(MatSort, {static: true}) sort: MatSort;

    depotsdataSource = new MatTableDataSource<Depot>();
    comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
    fueltypesArray = FuelNamesArray;
    priceColumns = ["depot", "pms_price", "pms_avgprice", "ago_price", "ago_avgprice", "ik_price", "ik_avgprice"];
    activedepot: { depot: Depot, config: DepotConfig } = {depot: {...emptydepot}, config: {...emptyDepotConfig}};

    avgprices: {
        [key in FuelType]: {
            total: BehaviorSubject<number>,
            avg: BehaviorSubject<number>,
            prices: BehaviorSubject<Array<Price>>
        }
    } = {
        pms: {
            total: new BehaviorSubject<number>(0),
            avg: new BehaviorSubject<number>(0),
            prices: new BehaviorSubject<Array<Price>>([])
        },
        ago: {
            total: new BehaviorSubject<number>(0),
            avg: new BehaviorSubject<number>(0),
            prices: new BehaviorSubject<Array<Price>>([])
        },
        ik: {
            total: new BehaviorSubject<number>(0),
            avg: new BehaviorSubject<number>(0),
            prices: new BehaviorSubject<Array<Price>>([])
        }
    };

    constructor(
        private core: CoreService,
    ) {

        this.core.depots
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

}
