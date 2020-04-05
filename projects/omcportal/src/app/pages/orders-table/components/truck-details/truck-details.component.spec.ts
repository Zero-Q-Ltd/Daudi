import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {TruckDetailsComponent} from "./truck-details.component";

describe("TruckDetailsComponent", () => {
  let component: TruckDetailsComponent;
  let fixture: ComponentFixture<TruckDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TruckDetailsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TruckDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
