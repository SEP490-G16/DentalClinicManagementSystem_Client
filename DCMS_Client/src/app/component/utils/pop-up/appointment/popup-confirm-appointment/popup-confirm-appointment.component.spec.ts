import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfirmAppointmentComponent } from './popup-confirm-appointment.component';

describe('PopupConfirmAppointmentComponent', () => {
  let component: PopupConfirmAppointmentComponent;
  let fixture: ComponentFixture<PopupConfirmAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupConfirmAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupConfirmAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
