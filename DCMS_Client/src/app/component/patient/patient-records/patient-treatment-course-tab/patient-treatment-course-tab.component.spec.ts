import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTreatmentCourseTabComponent } from './patient-treatment-course-tab.component';

describe('PatientTreatmentCourseTabComponent', () => {
  let component: PatientTreatmentCourseTabComponent;
  let fixture: ComponentFixture<PatientTreatmentCourseTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientTreatmentCourseTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientTreatmentCourseTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
