import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {ConfirmDepotComponent} from "./confirm-depot.component";

describe("ConfirmDepotComponent", () => {
  let component: ConfirmDepotComponent;
  let fixture: ComponentFixture<ConfirmDepotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmDepotComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDepotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
