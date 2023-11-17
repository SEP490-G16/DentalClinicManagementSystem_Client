import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddTreatmentcourseComponent } from './popup-add-treatmentcourse.component';

describe('PopupAddTreatmentcourseComponent', () => {
  let component: PopupAddTreatmentcourseComponent;
  let fixture: ComponentFixture<PopupAddTreatmentcourseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddTreatmentcourseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddTreatmentcourseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
