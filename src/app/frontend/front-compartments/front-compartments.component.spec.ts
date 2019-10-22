import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FrontCompartmentsComponent} from "./front-compartments.component";

describe("FrontCompartmentsComponent", () => {
  let component: FrontCompartmentsComponent;
  let fixture: ComponentFixture<FrontCompartmentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrontCompartmentsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontCompartmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
