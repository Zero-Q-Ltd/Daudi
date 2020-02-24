import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ReplaySubject } from 'rxjs';
import { emptyorder } from '../../models/Daudi/order/Order';
import { emptytruck } from '../../models/Daudi/order/truck/Truck';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit, OnDestroy {
  position = 'above';

  minDate = new Date(2017, 8, 26);
  maxDate = new Date();

  date = new FormControl(new Date());
  searchinit = false;

  dataobject = {};
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar) {
    this.changedatamodel(0);
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

  changedatamodel(index: number) {
    switch (index) {
      case 0:
        this.dataobject = { ...emptyorder };
        this.initvalues();
        break;
      case 1:
        this.dataobject = { ...emptytruck };
        this.initvalues();
        break;
    }
  }

  search() {

  }

}
