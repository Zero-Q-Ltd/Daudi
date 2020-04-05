import {async, ComponentFixture, TestBed} from "@angular/core/testing";

import {UserLevelsComponent} from "./user-levels.component";

describe("UserLevelsComponent", () => {
  let component: UserLevelsComponent;
  let fixture: ComponentFixture<UserLevelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UserLevelsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UserLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
