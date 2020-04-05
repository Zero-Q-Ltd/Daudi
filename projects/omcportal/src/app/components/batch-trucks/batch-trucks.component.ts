import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { TooltipPosition } from "@angular/material/tooltip";
import * as moment from "moment";
import { ReplaySubject } from "rxjs";
import { Truck } from "../../models/Daudi/order/truck/Truck";
import { OrderDetailsComponent } from "../../pages/orders-table/components/order-details/order-details.component";

@Component({
  selector: "batch-trucks",
  templateUrl: "./batch-trucks.component.html",
  styleUrls: ["./batch-trucks.component.scss"],
})
export class BatchTrucksComponent implements OnInit, OnDestroy {
  trucks: any[];
  position: TooltipPosition = "above"; // for tooltip
  batchdId: string = null;
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    @Inject(MAT_DIALOG_DATA) private batchdata: object,
    private dialog: MatDialog
  ) {
    console.log(this.batchdata);
    // this.batchdId = batchdata.batchdId;
  }

  openTruckDetails(clickedTruck: Truck) {
    const dialogRef = this.dialog.open(OrderDetailsComponent, {
      role: "dialog",
      data: this.compileProperties(clickedTruck),
      height: "auto",
      // width: '100%%',
    });
  }

  compileProperties(clickedTruck) {}

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  export() {
    console.log(this.trucks);
    // // console.log('this.trucks')
    // var ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet (this.trucks)

    // // var blob = new File(xls,'Data.xls', { exampledata: "text/plain;charset=utf-8" });
    // // console.log(xls)
    // const wb: XLSX.WorkBook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    // // wb.Sheets['DATA'] = XLSX.utils.json_to_sheet(this.trucks)
    // var wopts = { BookType: 'xlsx', bookSST: false, Type: 'array' };

    // const wbout: string = XLSX.write(wb, { bookType: 'xlsx', exampledata: 'array' });
    // fs.saveAs(new Blob([wbout]), `${this.batchdId}.xlsx`);
  }

  ngOnInit() {}

  creationtime(time) {
    return moment(time).format("MMMM Do YYYY, h:mm a");
  }
}
