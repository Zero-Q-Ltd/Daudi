import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ColumnsCustomizerComponent} from './columns-customizer.component';

describe('ColumnsCustomizerComponent', () => {
  let component: ColumnsCustomizerComponent;
  let fixture: ComponentFixture<ColumnsCustomizerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ColumnsCustomizerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnsCustomizerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
