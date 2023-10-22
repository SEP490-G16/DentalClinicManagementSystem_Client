import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistAppointmentListComponent } from './receptionist-appointment-list.component';

describe('ReceptionistAppointmentListComponent', () => {
  let component: ReceptionistAppointmentListComponent;
  let fixture: ComponentFixture<ReceptionistAppointmentListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionistAppointmentListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistAppointmentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
