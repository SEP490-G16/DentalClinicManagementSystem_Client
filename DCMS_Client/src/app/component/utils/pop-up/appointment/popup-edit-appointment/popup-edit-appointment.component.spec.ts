import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditAppointmentComponent } from './popup-edit-appointment.component';

describe('PopupEditAppointmentComponent', () => {
  let component: PopupEditAppointmentComponent;
  let fixture: ComponentFixture<PopupEditAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
