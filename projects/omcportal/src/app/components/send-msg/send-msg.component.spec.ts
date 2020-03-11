import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SendMsgComponent} from './send-msg.component';

describe('SendMsgComponent', () => {
  let component: SendMsgComponent;
  let fixture: ComponentFixture<SendMsgComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SendMsgComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SendMsgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
