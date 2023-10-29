import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddPatientComponent } from './popup-add-patient.component';

describe('PopupAddPatientComponent', () => {
  let component: PopupAddPatientComponent;
  let fixture: ComponentFixture<PopupAddPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
