import {ChangeDetectorRef, Component} from '@angular/core';
import * as moment from 'moment';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {DateAdapter, SatCalendar, SatCalendarFooter, SatDatepicker} from 'saturn-datepicker';

@Component({
  selector: 'app-calendar-ranges',
  templateUrl: './calendar-ranges.component.html',
  styleUrls: ['./calendar-ranges.component.scss']
})

export class CalendarRangesComponent<Date> implements SatCalendarFooter<Date> {
  public ranges: Array<{ key: string, label: string }> = [
    {key: 'last3Months', label: 'Last 3 Months (Default)'},
    {key: 'last6Months', label: 'Last 6 Months'},
    {key: 'thisYear', label: 'last 1 Year'},
  ];
  private destroyed = new Subject<void>();

  constructor(
    private calendar: SatCalendar<Date>,
    private datePicker: SatDatepicker<Date>,
    private dateAdapter: DateAdapter<Date>,
    cdr: ChangeDetectorRef
  ) {
    calendar.stateChanges
      .pipe(takeUntil(this.destroyed))
      .subscribe(() => cdr.markForCheck());
  }

  setRange(range: string) {
    switch (range) {
      case 'last3Months':
        this.calendar.beginDate = this.dateAdapter.deserialize(moment().subtract(3, 'M').startOf('day').toDate());
        this.calendar.endDate = this.dateAdapter.deserialize(moment().toDate());
        break;
      case 'last6Months':
        this.calendar.beginDate = this.dateAdapter.deserialize(moment().subtract(6, 'M').startOf('day').toDate());
        this.calendar.endDate = this.dateAdapter.deserialize(moment().toDate());
        break;
      case 'thisYear':
        this.calendar.beginDate = this.dateAdapter.deserialize(moment().subtract(12, 'M').startOf('day').toDate());
        this.calendar.endDate = this.dateAdapter.deserialize(moment().toDate());
        break;
    }
    this.calendar.activeDate = this.calendar.beginDate;
    this.calendar.beginDateSelectedChange.emit(this.calendar.beginDate);
    this.calendar.dateRangesChange.emit({begin: this.calendar.beginDate, end: this.calendar.endDate});
    this.datePicker.close();
  }
}
