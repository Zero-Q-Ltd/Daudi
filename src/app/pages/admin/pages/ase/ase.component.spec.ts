import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AseComponent} from './ase.component';

describe('AseComponent', () => {
  let component: AseComponent;
  let fixture: ComponentFixture<AseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AseComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
