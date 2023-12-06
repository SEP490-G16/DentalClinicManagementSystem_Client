import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmAddTreatmentcourseComponent } from './confirm-add-treatmentcourse.component';

describe('ConfirmAddTreatmentcourseComponent', () => {
  let component: ConfirmAddTreatmentcourseComponent;
  let fixture: ComponentFixture<ConfirmAddTreatmentcourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmAddTreatmentcourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmAddTreatmentcourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
