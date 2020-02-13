import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntryAssignComponent } from './entry-assign.component';

describe('EntryAssignComponent', () => {
  let component: EntryAssignComponent;
  let fixture: ComponentFixture<EntryAssignComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EntryAssignComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EntryAssignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
