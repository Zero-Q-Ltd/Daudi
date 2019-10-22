import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FamilyLoginComponent} from "./family-login.component";

describe("FamilyLoginComponent", () => {
  let component: FamilyLoginComponent;
  let fixture: ComponentFixture<FamilyLoginComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyLoginComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
