import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FamilyProfileComponent} from "./family-profile.component";

describe("FamilyProfileComponent", () => {
  let component: FamilyProfileComponent;
  let fixture: ComponentFixture<FamilyProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyProfileComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
