import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { EntriesSelectorComponent } from "./entries-selector.component";

describe("BatchesSelectorComponent", () => {
  let component: EntriesSelectorComponent;
  let fixture: ComponentFixture<EntriesSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EntriesSelectorComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntriesSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
