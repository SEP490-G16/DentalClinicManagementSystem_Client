import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupRegisterWorkScheduleComponent } from './popup-register-work-schedule.component';

describe('PopupRegisterWorkScheduleComponent', () => {
  let component: PopupRegisterWorkScheduleComponent;
  let fixture: ComponentFixture<PopupRegisterWorkScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupRegisterWorkScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupRegisterWorkScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
