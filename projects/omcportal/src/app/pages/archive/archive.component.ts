import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ReplaySubject, Subject } from "rxjs";
import { emptyorder, Order } from "../../models/Daudi/order/Order";
import { emptytruck } from "../../models/Daudi/order/truck/Truck";
import { CoreService } from 'app/services/core/core.service';
import { OrdersService } from 'app/services/orders.service';
import { toArray } from 'app/models/utils/SnapshotUtils';
import { DaudiCustomer } from 'app/models/Daudi/customer/Customer';
import { values } from 'lodash';
import { FuelType } from 'app/models/Daudi/fuel/FuelType';

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

  searchRange = true

  dataobject = {};
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  searchCriteria: Array<{ id: number, name: string }> = [{ name: 'Date', id: 0 }, { name: 'Customer', id: 1 }, { name: 'Batch#', id: 2 }]
  selectedCriteria: number = 0
  loadingordders = false;
  fetchedOrders: Order[]
  selectedcompany: DaudiCustomer
  filteredCompanies: Subject<DaudiCustomer[]> = new Subject();
  loadingcustomers = false;
  companyName = new FormControl("", [Validators.required])
  batch = new FormControl("", [Validators.required])
  fuelType: FuelType = FuelType.pms
  // selectedDates:
  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private core: CoreService,
    private ordersService: OrdersService,
    fb: FormBuilder) {
    this.dateForm = fb.group({
      date: [{ begin: new Date(2018, 7, 5), end: new Date(2018, 7, 25) }]
    });
    this.companyName.valueChanges.subscribe(tt => {
      this.filteredCompanies.next(this._filter(this.companyName.value));
    })

  }

  initvalues() {
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
    this.comopnentDestroyed.complete();
  }
  companyselect(selectedcompany: DaudiCustomer) {

    this.selectedcompany = selectedcompany;
  }
  toggleselection() {

  }


  search() {
    this.loadingordders = true
    switch (this.selectedCriteria) {
      case 0:
        let start = this.dateForm.controls["date"].value["begin"]
        let stop = this.dateForm.controls["date"].value["end"]
        console.log(start, stop)

        this.ordersService.searchDate(start, stop, this.core.omcId).get().then(data => {
          this.loadingordders = false
          this.fetchedOrders = toArray(emptyorder, data)
        }).catch(e => {
          this.loadingordders = false

          console.error(e)
        })
        break;
      case 1:
        this.ordersService.searchCompany(this.companyName.value, this.core.omcId).get().then(data => {
          this.loadingordders = false
          this.fetchedOrders = toArray(emptyorder, data)
        }).catch(e => {
          this.loadingordders = false

          console.error(e)
        })
        break;

      default:

        this.ordersService.searchEntry(start, stop, this.core.omcId).get().then(data => {
          this.loadingordders = false
          this.fetchedOrders = toArray(emptyorder, data)
        }).catch(e => {
          this.loadingordders = false
          console.error(e)
        })
        break;
    }
  }
  private _filter(value: string): DaudiCustomer[] {
    if (!value) {
      return;
    }
    const filterValue = value.toLowerCase();
    return this.core.customers.value.filter(option =>
      option.name.toLowerCase().includes(filterValue)
    );
  }
}
