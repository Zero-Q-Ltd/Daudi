import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {EmkayFamilyComponent} from "./emkay-family.component";

describe("EmkayFamilyComponent", () => {
  let component: EmkayFamilyComponent;
  let fixture: ComponentFixture<EmkayFamilyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EmkayFamilyComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmkayFamilyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
