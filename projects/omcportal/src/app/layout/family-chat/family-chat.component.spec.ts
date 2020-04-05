import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {FamilyChatComponent} from "./family-chat.component";

describe("FamilyChatComponent", () => {
  let component: FamilyChatComponent;
  let fixture: ComponentFixture<FamilyChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FamilyChatComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FamilyChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
