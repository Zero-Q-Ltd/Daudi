import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminLevelsComponent } from './admin-levels.component';

describe('AdminLevelsComponent', () => {
  let component: AdminLevelsComponent;
  let fixture: ComponentFixture<AdminLevelsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminLevelsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
