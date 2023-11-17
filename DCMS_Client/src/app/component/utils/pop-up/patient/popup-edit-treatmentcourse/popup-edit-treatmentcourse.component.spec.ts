import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditTreatmentcourseComponent } from './popup-edit-treatmentcourse.component';

describe('PopupEditTreatmentcourseComponent', () => {
  let component: PopupEditTreatmentcourseComponent;
  let fixture: ComponentFixture<PopupEditTreatmentcourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditTreatmentcourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditTreatmentcourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
