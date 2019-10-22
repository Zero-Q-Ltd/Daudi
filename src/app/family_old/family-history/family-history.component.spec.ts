import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FamilyHistoryComponent} from "./family-history.component";

describe("FamilyHistoryComponent", () => {
  let component: FamilyHistoryComponent;
  let fixture: ComponentFixture<FamilyHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyHistoryComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
