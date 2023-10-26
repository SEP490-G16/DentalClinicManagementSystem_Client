import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeAppointmentComponent } from './change-appointment.component';

describe('ChangeAppointmentComponent', () => {
  let component: ChangeAppointmentComponent;
  let fixture: ComponentFixture<ChangeAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeAppointmentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
