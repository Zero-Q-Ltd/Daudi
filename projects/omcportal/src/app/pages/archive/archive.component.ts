import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReplaySubject } from "rxjs";
import { emptyorder } from "../../models/Daudi/order/Order";
import { emptytruck } from "../../models/Daudi/order/truck/Truck";
interface SatDatepickerRangeValue<D> {
  begin: D | null;
  end: D | null;
}
@Component({
  selector: "app-archive",
  templateUrl: "./archive.component.html",
  styleUrls: ["./archive.component.scss"]
})

export class ArchiveComponent implements OnInit, OnDestroy {
  position = "above";

  minDate = new Date(2017, 8, 26);
  maxDate = new Date();

  dateForm: FormGroup;
  searchinit = false;

  searchRange = false

  dataobject = {};
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  searchCriteria: Array<{ id: number, name: string }> = [{ name: 'Date', id: 0 }, { name: 'Customer', id: 1 }, { name: 'Batch#', id: 2 }]
  selectedCriteria: number
  loadingordders = true;

  // selectedDates:
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    fb: FormBuilder) {
    this.dateForm = fb.group({
      date: [{ begin: new Date(2018, 7, 5), end: new Date(2018, 7, 25) }]
    });
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
