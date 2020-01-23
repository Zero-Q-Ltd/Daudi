import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SmsLogsComponent} from './sms-logs.component';

describe('SmsLogsComponent', () => {
  let component: SmsLogsComponent;
  let fixture: ComponentFixture<SmsLogsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SmsLogsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmsLogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
