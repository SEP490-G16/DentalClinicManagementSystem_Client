import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeletePatientComponent } from './popup-delete-patient.component';

describe('PopupDeletePatientComponent', () => {
  let component: PopupDeletePatientComponent;
  let fixture: ComponentFixture<PopupDeletePatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeletePatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeletePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
