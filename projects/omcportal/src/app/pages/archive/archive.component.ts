import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReplaySubject } from "rxjs";
import { emptyorder } from "../../models/Daudi/order/Order";
import { emptytruck } from "../../models/Daudi/order/truck/Truck";

@Component({
  selector: "app-archive",
  templateUrl: "./archive.component.html",
  styleUrls: ["./archive.component.scss"]
})
export class ArchiveComponent implements OnInit, OnDestroy {
  position = "above";

  minDate = new Date(2017, 8, 26);
  maxDate = new Date();

  date = new FormControl(new Date());
  searchinit = false;

  dataobject = {};
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  searchCriteria: Array<{ id: number, name: string }> = [{ name: 'Date', id: 0 }, { name: 'Customer', id: 1 }]
  selectedCriteria: number

  // selectedDates:
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {
  }

  initvalues() {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }

  toggleselection() {

  }


  search() {
    switch (this.selectedCriteria) {
      case 0:

        break;

      default:
        break;
    }
  }

}
