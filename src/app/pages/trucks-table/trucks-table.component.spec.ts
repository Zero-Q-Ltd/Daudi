import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TrucksTableComponent} from './trucks-table.component';

describe('TrucksTableComponent', () => {
  let component: TrucksTableComponent;
  let fixture: ComponentFixture<TrucksTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TrucksTableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrucksTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
