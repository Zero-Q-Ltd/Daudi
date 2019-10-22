import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FrontLoadComponent} from "./front-load.component";

describe("FrontLoadComponent", () => {
  let component: FrontLoadComponent;
  let fixture: ComponentFixture<FrontLoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FrontLoadComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FrontLoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should be created", () => {
    expect(component).toBeTruthy();
  });
});
