import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientExaminationManagementComponent } from './patient-examination-management.component';

describe('PatientExaminationManagementComponent', () => {
  let component: PatientExaminationManagementComponent;
  let fixture: ComponentFixture<PatientExaminationManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientExaminationManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientExaminationManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
