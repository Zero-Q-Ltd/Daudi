import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CalendarRangesComponent} from './calendar-ranges.component';

describe('CalendarRangesComponent', () => {
    let component: CalendarRangesComponent;
    let fixture: ComponentFixture<CalendarRangesComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CalendarRangesComponent]
        })
            .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CalendarRangesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
