import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FamilyDiscountComponent} from "./family-discount.component";

describe("FamilyDiscountComponent", () => {
  let component: FamilyDiscountComponent;
  let fixture: ComponentFixture<FamilyDiscountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyDiscountComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyDiscountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
