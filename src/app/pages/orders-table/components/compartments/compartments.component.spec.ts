import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CompartmentsComponent} from './compartments.component';

describe('CompartmentsComponent', () => {
  let component: CompartmentsComponent;
  let fixture: ComponentFixture<CompartmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CompartmentsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
