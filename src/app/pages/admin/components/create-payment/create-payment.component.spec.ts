import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePaymentComponent } from './create-payment.component';

describe('CreatePaymentComponent', () => {
  let component: CreatePaymentComponent;
  let fixture: ComponentFixture<CreatePaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreatePaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
