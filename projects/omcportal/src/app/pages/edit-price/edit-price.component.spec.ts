import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {EditPriceComponent} from "./edit-price.component";

describe("EditPriceComponent", () => {
  let component: EditPriceComponent;
  let fixture: ComponentFixture<EditPriceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditPriceComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPriceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
