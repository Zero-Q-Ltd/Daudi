import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { EmptyEntryDraw, EntryDraw, Entry } from 'app/models/Daudi/fuel/Entry';
import { FuelType } from 'app/models/Daudi/fuel/FuelType';
import { CoreService } from 'app/services/core/core.service';
import { ReplaySubject } from 'rxjs';
import { delay, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-entry-selector',
  templateUrl: './entry-selector.component.html',
  styleUrls: ['./entry-selector.component.scss']
})
export class EntrySelectorComponent implements OnInit, OnDestroy, OnChanges {

  entries: MatTableDataSource<Entry & EntryDraw> = new MatTableDataSource<Entry & EntryDraw>([]);
  comopnentDestroyed: ReplaySubject<boolean> = new ReplaySubject<boolean>();
  displayedColumns: string[] = [
    'select',
    'id',
    'date',
    'entry',
    'totalqty',
    'loadedqty',
    'availableqty',
    'transferqty',
    'remainqty',
    'status'];
  footerColumns = ['Error', 'Total', 'TotalValue', 'Okay'];
  selection = new SelectionModel<Entry & EntryDraw>(true, [], true);
  drwanQtyControls: FormControl[] = [];

  @Input() fuelType: FuelType;
  @Input() qtyToDraw: number;
  @Output() selectedEntries = new EventEmitter<(Entry & EntryDraw)[]>();
  @Output() validEntryForms = new EventEmitter<boolean>();
  @Output() validTotals = new EventEmitter<boolean>();
  totalEntryDraw = 0;
  constructor(
    private core: CoreService) {

  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: Entry & EntryDraw): string {
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
    if (this.isAllSelected()) {
      this.selection.clear();
      this.entries.data.forEach((row, index) => {
        this.drwanQtyControls[index].disable();
      });

    } else {
      this.entries.data.forEach((row, index) => {
        this.drwanQtyControls[index].enable();
        this.selection.select(row);
      });
    }
  }

  calculateTotals() {
    this.totalEntryDraw = 0;
    let validDraws = true;

    const _selectedEntries = [];
    this.drwanQtyControls.forEach((control, index) => {
      this.entries.data[index].qtyDrawn = 0;
      /**
       * calculate the correct remaining amount before deducting the entered amount
       */

      this.entries.data[index].qtyRemaining =
        this.entries.data[index].qty.total - this.entries.data[index].qty.used;
      /**
       * Reset the status
       */
      this.entries.data[index].resultStatus = true;

      if (control.invalid) {
        validDraws = false;
      }
      if (control.enabled) {
        /**
         * Deduct the amount entered
         */
        this.entries.data[index].qtyRemaining -= control.value || 0;
        this.totalEntryDraw += control.value || 0;
        /**
         * Set the qty drawn
         */
        this.entries.data[index].qtyDrawn = +control.value;

        /**
         * Set the remaining amount status of the fuel
         */
        if (this.entries.data[index].qtyRemaining <= 0) {
          this.entries.data[index].resultStatus = false;
        }
        /**
         * Add the result to the list of selected Entries
         */
        _selectedEntries.push(this.entries.data[index]);
      }
    });
    this.validTotals.emit(this.totalEntryDraw === this.qtyToDraw);
    this.validEntryForms.emit(validDraws);
    this.selectedEntries.emit(_selectedEntries);
  }
  /**
   * Check if the totals are okay every time the input values change
   * @param changes
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    /**
     * Avoid ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked
     */
    await delay(50);
    this.validTotals.emit(this.totalEntryDraw === this.qtyToDraw);
  }
  ngOnInit() {
    this.core.depotEntries[this.fuelType].pipe(takeUntil(this.comopnentDestroyed)).subscribe(entries => {
      this.entries.data = entries.map((entry, index) => {
        this.drwanQtyControls[index] = new FormControl({
          value: 0,
          disabled: true
        },
          [Validators.required, Validators.min(0),
          /**
           * Allow the value to exactly equal to the required amount
           */
          Validators.max(entry.qty.total - entry.qty.used),
          /**
           * Allow only numbers to be entered
           */
          Validators.pattern('^[1-9]\\d*$')]);

        this.drwanQtyControls[index].valueChanges.subscribe(() => {
          this.calculateTotals();
        });

        return { ...entry, ...EmptyEntryDraw };

      });
    });

    /**
     * Only enable the input if the row has been selected
     */
    this.selection.changed.pipe(takeUntil(this.comopnentDestroyed))
      .subscribe((val) => {
        /**
         * A change is either added or removed
         */
        // console.log(val);
        if (val.added.length > 0) {
          this.drwanQtyControls[this.entries.data.findIndex(t => t === val.added[0])].enable();
        } else {
          const index = this.entries.data.findIndex(t => t === val.removed[0]);
          /**
           * Also zero the value when the form is disabled
           */
          this.drwanQtyControls[index].setValue(0);
          this.drwanQtyControls[index].disable();
        }
      });
  }

  ngOnDestroy(): void {
    this.comopnentDestroyed.next(true);
  }

}
