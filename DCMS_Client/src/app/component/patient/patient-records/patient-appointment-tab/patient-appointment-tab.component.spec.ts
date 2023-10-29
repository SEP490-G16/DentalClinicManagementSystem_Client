import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAppointmentTabComponent } from './patient-appointment-tab.component';

describe('PatientAppointmentTabComponent', () => {
  let component: PatientAppointmentTabComponent;
  let fixture: ComponentFixture<PatientAppointmentTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientAppointmentTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientAppointmentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
