import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource } from '@angular/material';
import { Entry } from 'app/models/Daudi/fuel/Entry';
import { FuelType } from 'app/models/Daudi/fuel/FuelType';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-entry-selector',
  templateUrl: './entry-selector.component.html',
  styleUrls: ['./entry-selector.component.scss']
})
export class EntrySelectorComponent implements OnInit, OnDestroy {
  entries: MatTableDataSource<Entry> = new MatTableDataSource<Entry>([]);
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  displayedColumns: string[] = ['select', 'id', 'date', 'entry', 'totalqty', 'transferqty', 'loadedqty', 'availableqty', 'status'];
  selection = new SelectionModel<Entry>(true, []);

  @Input() fuelType: FuelType;
  @Input() qty: number;
  @Output() selectedEntries = new EventEmitter<Entry[]>();
  constructor(
    private core: CoreService) {

  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Entry): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.entry.name}`;
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.entries.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.entries.data.forEach(row => this.selection.select(row));
  }

  ngOnInit() {
    this.core.depotEntries[this.fuelType].pipe(takeUntil(this.comopnentDestroyed)).subscribe(entries => {
      this.entries.data = entries;
    });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
  }

}
