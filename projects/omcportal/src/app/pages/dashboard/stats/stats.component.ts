import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { CoreService } from "app/services/core/core.service";
import { DepotService } from "app/services/core/depot.service";
import { EntriesService } from "app/services/entries.service";
import { PricesService } from "app/services/prices.service";
import { StatsService } from "app/services/stats.service";
import { EChartOption } from "echarts";
import "echarts/theme/macarons.js";
import * as moment from "moment";
import { ReplaySubject } from "rxjs";
import { skipWhile, takeUntil } from "rxjs/operators";
import { Price } from "../../../models/Daudi/depot/Price";
import { Entry } from "../../../models/Daudi/fuel/Entry";
import { FuelNamesArray, FuelType } from "../../../models/Daudi/fuel/FuelType";
import { CalendarRangesComponent } from "../calendar-ranges/calendar-ranges.component";
import { FuelBoundstats } from "../charts/charts.config";
import { singleFuelpricestat } from "../charts/prices";
import { fuelgauge } from "../charts/qty";
import { saleStats } from "../charts/sales";
import { MatSnackBar } from "@angular/material/snack-bar";
import { emptyTimeStats, TimeStats } from "app/models/Daudi/stats/TimeStats";
import { toArray } from "app/models/utils/SnapshotUtils";
import { ParseDatePipe } from "app/shared/pipes/parse-date.pipe";

@Component({
  selector: "app-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"]
})
export class StatsComponent implements OnInit, OnDestroy {
  date = moment();
  fuelgauge = {
    pms: fuelgauge.pms,
    ago: fuelgauge.ago,
    ik: fuelgauge.ik
  };
  rangesFooter = CalendarRangesComponent;
  saleStats: EChartOption = saleStats;
  priceStats: FuelBoundstats = {
    pms: this.assignvalues("pms"),
    ago: this.assignvalues("ago"),
    ik: this.assignvalues("ik")
  };

  fueltypesArray = FuelNamesArray;
  emptystats = {
    thisweek: { ...emptyTimeStats },
    lastweek: { ...emptyTimeStats },
    thismonth: { ...emptyTimeStats },
    lastmonth: { ...emptyTimeStats },
    thisyear: { ...emptyTimeStats },
    lastyear: { ...emptyTimeStats }
  };
  stats: {
    thisweek: TimeStats;
    lastweek: TimeStats;
    thismonth: TimeStats;
    lastmonth: TimeStats;
    thisyear: TimeStats;
    lastyear: TimeStats;
  } = this.emptystats;
  axisdates: { date: Date; pos: number }[] = [];
  dateControl: FormControl = new FormControl({
    begin: new Date(
      moment()
        .subtract(3, "M")
        .startOf("day")
        .toDate()
    ),
    end: new Date()
  });
  minDate = new Date(2000, 0, 1);
  maxDate = new Date();

  isLoadingsalesStats = true;
  isLoadingPrices = true;
  isLoadingFuelqty = {
    pms: true,
    ago: true,
    ik: true
  };
  /**
   * this keeps a local copy of all the subscriptions within this service
   */
  subscriptions: Map<string, any> = new Map<string, any>();
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private router: Router,
    public snackBar: MatSnackBar,
    private depotservice: DepotService,
    private entriesService: EntriesService,
    private statservice: StatsService,
    private core: CoreService,
    private priceservice: PricesService,
    private parseDate: ParseDatePipe
  ) {
    this.core.activedepot
      .pipe(
        skipWhile(d => !d.depot.Id),
        takeUntil(this.comopnentDestroyed)
      )
      .subscribe(depot => {
        this.dateControl.valueChanges
          .pipe(takeUntil(this.comopnentDestroyed))
          .subscribe(value => {
            const a = moment(value.begin);
            const b = moment(value.end);
            this.getstats(Math.abs(a.diff(b, "days")));
          });
        /**
         * reset loading every time the depot is changed
         */
        this.isLoadingsalesStats = true;
        this.isLoadingPrices = true;
        this.isLoadingFuelqty = {
          pms: true,
          ago: true,
          ik: true
        };
        /**
         * Load data for the last 1 months by default, dont forget to reset the FormControl every time the depot changes
         */
        this.dateControl.reset({
          begin: new Date(
            moment()
              .subtract(3, "M")
              .startOf("day")
              .toDate()
          ),
          end: new Date()
        });
        this.fueltypesArray.forEach(fueltype => {
          this.core.depotEntries[fueltype]
            .pipe(takeUntil(this.comopnentDestroyed))
            .subscribe((batches: Entry[]) => {
              /**
               * Reset the values every time the batches change
               */
              this.fuelgauge[fueltype].series[0].max = 0;
              this.fuelgauge[fueltype].series[0].data[0].value = 0;
              this.fuelgauge[fueltype] = { ...fuelgauge[fueltype] };

              batches.forEach(batch => {
                /**
                 * force change detection in the charts directive
                 */
                this.fuelgauge[fueltype] = { ...fuelgauge[fueltype] };
                this.fuelgauge[fueltype].series[0].max += Math.round(
                  batch.qty.total / 1000
                );
                const available = this.getTotalAvailable(batch);
                this.fuelgauge[fueltype].series[0].data[0].value += Math.round(
                  available / 1000
                );
              });
            });
          this.isLoadingFuelqty[fueltype] = false;
        });
      });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.subscriptions.forEach(value => {
      value();
    });
  }

  assignvalues(fueltype: string): EChartOption {
    const localvar: EChartOption = JSON.parse(
      JSON.stringify(singleFuelpricestat)
    );
    // @ts-ignore
    localvar.title.text = fueltype.toUpperCase();
    return localvar;
  }

  getTotalAvailable(batch: Entry) {
    const totalqty = batch.qty.total;
    const totalLoaded =
      batch.qty.directLoad.total + batch.qty.transferred.total;
    return totalqty - totalLoaded;
  }

  /**
   * please proceed with caution beyond this point
   * Danger zone
   */
  getstats(dayCount: number) {
    /**
     * generate an array of dates that will be used in the x axis
     */
    const datesrange = [];
    this.saleStats.xAxis[0].data = [];
    for (let i = dayCount; i >= 0; i--) {
      const temp = moment()
        .subtract(i, "days")
        .startOf("day")
        .toDate();
      datesrange[dayCount - i] = temp;
      this.saleStats.xAxis[0].data.push(moment(temp).format("DD-MM-YY"));
    }
    /**
     * this is where all the magic happes
     */
    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("statsrange")) {
      this.subscriptions.get("statsrange")();
    }
    const subscription = this.statservice
      .getstatsrange(
        this.core.omcId,
        moment()
          .startOf("day")
          .subtract(dayCount, "days")
          .toDate(),
        moment().toDate()
      )
      .orderBy("date", "desc")
      .onSnapshot(saleshistory => {
        /**
         * remove results from weeks, months, years by filtering
         */
        this.saleStats = { ...saleStats };
        const fetchedHistory = toArray(emptyTimeStats, saleshistory);

        /**
         * create a temporary array to avoid mutation
         * Copy over the data because there's a possibiliy that the data in db has some missing dates
         * fill any missing date with the empty equivalent
         */
        console.log(fetchedHistory);

        const highest = {
          pms: 0,
          ago: 0,
          ik: 0
        };
        /**
         * Copy over the data
         */
        fetchedHistory.forEach((history, historyindex) => {
          switch (history.statType) {
            case "D":
              /**
               * find the highest in each fuel type
               */
              this.fueltypesArray.forEach((ftype, i) => {
                if (history.fuelsold[ftype].qty > highest[ftype]) {
                  highest[ftype] = history.fuelsold[ftype].qty;
                }
                this.saleStats.series[i + 1].data[dayCount - historyindex] =
                  history.fuelsold[ftype].qty;
              });
              return;
            case "W":
              const thisWeek = moment()
                .startOf("w")
                .toString();
              const lastWeek = moment()
                .startOf("w")
                .toString();

              if (
                moment(this.parseDate.transform(history.date))
                  .startOf("w")
                  .toString() === thisWeek
              ) {
                this.stats.thisweek = history;
              } else if (
                moment(this.parseDate.transform(history.date))
                  .startOf("w")
                  .toString() === lastWeek
              ) {
                this.stats.lastweek = history;
              }
            case "M":
              const thisMonth = moment()
                .startOf("m")
                .toString();
              const lastMonth = moment()
                .startOf("m")
                .toString();

              if (
                moment(this.parseDate.transform(history.date))
                  .startOf("m")
                  .toString() === thisMonth
              ) {
                this.stats.thismonth = history;
              } else if (
                moment(this.parseDate.transform(history.date))
                  .startOf("m")
                  .toString() === lastMonth
              ) {
                this.stats.lastmonth = history;
              }
            default:
              const thisYear = moment()
                .startOf("y")
                .toString();
              const lastYear = moment()
                .startOf("y")
                .toString();

              if (
                moment(this.parseDate.transform(history.date))
                  .startOf("y")
                  .toString() === thisYear
              ) {
                this.stats.thisyear = history;
              } else if (
                moment(this.parseDate.transform(history.date))
                  .startOf("w")
                  .toString() === lastYear
              ) {
                this.stats.lastyear = history;
              }
          }
        });
        this.isLoadingsalesStats = false;
      });
    this.subscriptions.set(`statsrange`, subscription);
  }

  readdb() {}

  ngOnInit() {}
}
