import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SupportChatComponent} from './support-chat.component';

describe('SupportChatComponent', () => {
  let component: SupportChatComponent;
  let fixture: ComponentFixture<SupportChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SupportChatComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupportChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
