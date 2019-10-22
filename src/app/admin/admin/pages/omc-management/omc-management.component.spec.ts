import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OmcManagementComponent} from './omc-management.component';

describe('OmcManagementComponent', () => {
  let component: OmcManagementComponent;
  let fixture: ComponentFixture<OmcManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OmcManagementComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OmcManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
