import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {BatchesSelectorComponent} from "./batches-selector.component";

describe("BatchesSelectorComponent", () => {
  let component: BatchesSelectorComponent;
  let fixture: ComponentFixture<BatchesSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BatchesSelectorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BatchesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
