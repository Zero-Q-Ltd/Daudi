import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import * as moment from "moment";
import { CalendarRangesComponent } from "../calendar-ranges/calendar-ranges.component";
import { EChartOption } from "echarts";
import { FuelBoundstats } from "../charts/charts.config";
import { emptystat, Stat } from "../../../models/stats/Stats";
import { FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material";
import { DepotsService } from "../../services/core/depots.service";
import { BatchesService } from "../../services/batches.service";
import { StatsService } from "../../services/stats.service";
import { PricesService } from "../../services/prices.service";
import { fueltypesArray } from "../../../models/fuel/Types";
import { Entry } from "../../../models/fuel/Entry";
import { Price } from "../../../models/depot/Price";
import { calculateMA } from "../charts/generalCalc";
import { fuelgauge } from "../charts/qty";
import { saleStats } from "../charts/sales";
import { singleFuelpricestat } from "../charts/prices";
import "echarts/theme/macarons.js";
import { ReplaySubject } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "app-stats",
  templateUrl: "./stats.component.html",
  styleUrls: ["./stats.component.scss"]
})
export class StatsComponent implements OnInit, OnDestroy {

  @Input() depotResolution: "All" | "CurrentDepot";
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


  allfueltypes = ["pms", "ago", "ik"];
  emptystats = {
    thisweek: { ...emptystat },
    lastweek: { ...emptystat },
    thismonth: { ...emptystat },
    lastmonth: { ...emptystat },
    thisyear: { ...emptystat },
    lastyear: { ...emptystat }
  };
  stats: {
    thisweek: Stat,
    lastweek: Stat,
    thismonth: Stat,
    lastmonth: Stat,
    thisyear: Stat
    lastyear: Stat
  } = this.emptystats;
  axisdates: Array<{ date: Date, pos: number }> = [];
  dateControl: FormControl = new FormControl({ begin: new Date(moment().subtract(3, "M").startOf("day").toDate()), end: new Date() });
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

  constructor(private router: Router,
              public snackBar: MatSnackBar,
              private depotservice: DepotsService,
              private batcheservice: BatchesService,
              private statservice: StatsService,
              private priceservice: PricesService) {
    this.depotservice.activedepot.pipe(takeUntil(this.comopnentDestroyed)).subscribe(depot => {
      this.dateControl.valueChanges.pipe(takeUntil(this.comopnentDestroyed)).subscribe(value => {
        const a = moment(value.begin);
        const b = moment(value.end);
        this.getstats(Math.abs(a.diff(b, "days")));
      });
      if (depot.Id) {
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
        this.dateControl.reset({ begin: new Date(moment().subtract(1, "M").startOf("day").toDate()), end: new Date() });
        fueltypesArray.forEach(fueltype => {
          this.batcheservice.depotbatches[fueltype].pipe(takeUntil(this.comopnentDestroyed)).subscribe((batches: Array<Entry>) => {
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
              this.fuelgauge[fueltype].series[0].max += Math.round(batch.qty / 1000);
              const available = this.getTotalAvailable(batch);
              this.fuelgauge[fueltype].series[0].data[0].value += Math.round(available / 1000);
            });
          });
          this.isLoadingFuelqty[fueltype] = false;
        });
      }
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
    const localvar: EChartOption = JSON.parse(JSON.stringify(singleFuelpricestat));
    // @ts-ignore
    localvar.title.text = fueltype.toUpperCase();
    return localvar;
  }

  getTotalAvailable(batch: Entry) {
    const totalqty = batch.qty;
    const loadedqty = batch.loadedqty;
    const accumulated = batch.accumulated;
    return totalqty - loadedqty + accumulated.usable;
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
      const temp = moment().subtract(i, "days").startOf("day").toDate();
      datesrange[dayCount - i] = temp;
      this.saleStats.xAxis[0].data.push(moment(temp).format("DD-MM-YY"));
      this.allfueltypes.forEach(ftype => {
        /**
         * Important so that later the array can be properly iterated
         */
        this.priceStats[ftype].xAxis.data.length = datesrange.length;
        this.priceStats[ftype].xAxis.data[dayCount - i] = moment(temp).format("DD-MM-YY");
        this.priceStats[ftype].series[0].data[dayCount - i] = [];
        this.priceStats[ftype].series[1].data[dayCount - i] = [];
        this.priceStats[ftype].series[2].data[dayCount - i] = [];
        this.priceStats[ftype].series[3].data[dayCount - i] = [];
        this.priceStats[ftype].series[4].data[dayCount - i] = [];
        this.axisdates[dayCount - i] = {
          date: temp,
          pos: dayCount - i
        };
      });
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
    const subscription = this.statservice.getstatsrange(
      moment().startOf("day").subtract(dayCount, "days").toDate(), moment().toDate())
      .orderBy("date", "desc")
      .onSnapshot(saleshistory => {
        /**
         * remove results from weeks, months, years by filtering
         */
        this.saleStats = { ...saleStats };
        const filteredhistory = saleshistory.docs.map(f => {
          const g = f.data();
          g.id = f.id;
          // console.log(g);
          return g as Stat;
        }).filter(c => {
          return c.id.indexOf("W") !== 0 && c.id.length === 10;
        });

        /**
         * create a temporary array to avoid mutation
         * Copy over the data because there's a possibiliy that the data in db has some missing dates
         * fill any missing date with the empty equivalent
         */
        const newfilteredhistory = [];
        datesrange.forEach((specificdate, index) => {
          if (!filteredhistory.find(hist => {
            if (hist && !hist.id) {
              return false;
            }
            if (hist.date && moment(hist.date.toDate()).isSame(specificdate)) {
              newfilteredhistory[dayCount - index] = hist;
              return true;
            }
          })) {
            newfilteredhistory[index] = { ...emptystat };
          }
        });

        const highest = {
          pms: 0,
          ago: 0,
          ik: 0
        };
        /**
         * Copy over the data
         */
        newfilteredhistory.forEach((history, historyindex) => {
          /**
           * find the highest in each fuel type
           */
          this.allfueltypes.forEach((ftype, i) => {
            if (history.fuelsold[ftype].qty > highest[ftype]) {
              highest[ftype] = history.fuelsold[ftype].qty;
            }
            // @ts-ignore
            this.saleStats.series[i + 1].data[dayCount - historyindex] = history.fuelsold[ftype].qty;
          });
        });
        this.isLoadingsalesStats = false;
      });
    this.subscriptions.set(`statsrange`, subscription);

    /**
     * Remove realtimeness to save on performance
     */
    this.priceservice.getAvgpricesrange(
      moment().startOf("day").subtract(dayCount, "days").toDate(),
      moment().toDate()).orderBy("user.time", "desc")
      .get().then(pricesinrange => {
        const prices = pricesinrange.docs.map(f => {
          const h = f.data();
          h.id = f.id;
          return h as Price;
        });
        prices.forEach(price => {
          // this.fuelstats = { ...allfuelstats };
          // if (this.axisdates.length == 29) {
          const position = this.axisdates.findIndex(mappeddate => {
            return moment(price.user.time.toDate()).startOf("day").isSame(mappeddate.date);
          });
          // console.log(position, price);
          // console.log(this.fuelstats[price.fueltytype].series[1]);
          /**
           * only push the data to the respective position, the iterate the sorted data to calculate MA's
           */
          // @ts-ignore
          this.priceStats[price.fueltytype].series[0].data[position].push(price.price);
          this.priceStats[price.fueltytype] = JSON.parse(JSON.stringify(this.priceStats[price.fueltytype]));
        });
        /**
         * MA calculation must be done sequentially, so wait until all the data has been mapped to the right position
         */
        this.allfueltypes.forEach(ftype => {
          const copy = JSON.parse(JSON.stringify(this.priceStats[ftype].series[0].data));
          copy.map((data, pos) => {
            // console.log(pos, data);
            // console.log(copy);
            this.priceStats[ftype].series[1].data = calculateMA(copy, 5);
            this.priceStats[ftype].series[2].data = calculateMA(copy, 10);
            this.priceStats[ftype].series[3].data = calculateMA(copy, 20);
            this.priceStats[ftype].series[4].data = calculateMA(copy, 30);
          });
          this.priceStats[ftype] = JSON.parse(JSON.stringify(this.priceStats[ftype]));
        });
        this.isLoadingPrices = false;
      });

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("thisweek")) {
      this.subscriptions.get("thisweek")();
    }
    const thisweeksubscription = this.statservice.getstats(moment().startOf("week").format("YYYY-MM-WW") + "W").onSnapshot(weekstatsobject => {
      this.stats.thisweek = Object.assign({}, emptystat, weekstatsobject.data() as Stat);
    });
    this.subscriptions.set(`thisweek`, thisweeksubscription);

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("lastweek")) {
      this.subscriptions.get("lastweek")();
    }
    const lastweeksubscription = this.statservice.getstats(moment().subtract(1, "week").startOf("week").format("YYYY-MM-WW") + "W").onSnapshot(weekstatsobject => {
      this.stats.lastweek = Object.assign({}, emptystat, weekstatsobject.data() as Stat);
    });
    this.subscriptions.set(`lastweek`, lastweeksubscription);

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("thismonth")) {
      this.subscriptions.get("thismonth")();
    }
    const thismonthsubscription = this.statservice.getstats(moment().startOf("month").format("YYYY-MM")).onSnapshot(monthtatsobject => {
      this.stats.thismonth = Object.assign({}, emptystat, monthtatsobject.data() as Stat);
    });
    this.subscriptions.set(`thismonth`, thismonthsubscription);

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("lastmonth")) {
      this.subscriptions.get("lastmonth")();
    }
    const lastmonthsubscription = this.statservice.getstats(moment().subtract(1, "month").startOf("month").format("YYYY-MM")).onSnapshot(monthtatsobject => {
      this.stats.lastmonth = Object.assign({}, emptystat, monthtatsobject.data() as Stat);
    });
    this.subscriptions.set(`lastmonth`, lastmonthsubscription);

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("thisyear")) {
      this.subscriptions.get("thisyear")();
    }
    const thisyearsubscription = this.statservice.getstats(moment().startOf("year").format("YYYY")).onSnapshot(yearstatsobject => {
      this.stats.thisyear = Object.assign({}, emptystat, yearstatsobject.data() as Stat);
    });
    this.subscriptions.set(`thisyear`, thisyearsubscription);

    /**
     * Unsubcribe to previous subscription if exists
     */
    if (this.subscriptions.has("lastyear")) {
      this.subscriptions.get("lastyear")();
    }
    const lastyearsubscription = this.statservice.getstats(moment().subtract(1, "year").startOf("year").format("YYYY")).onSnapshot(yeartatsobject => {
      this.stats.lastyear = Object.assign({}, emptystat, yeartatsobject.data() as Stat);
    });
    this.subscriptions.set(`lastyear`, lastyearsubscription);


  }


  readdb() {

  }

  ngOnInit() {
  }
}
