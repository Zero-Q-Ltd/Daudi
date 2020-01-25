import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyManagementComponent } from './company-management.component';

describe('CompanyManagementComponent', () => {
  let component: CompanyManagementComponent;
  let fixture: ComponentFixture<CompanyManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
