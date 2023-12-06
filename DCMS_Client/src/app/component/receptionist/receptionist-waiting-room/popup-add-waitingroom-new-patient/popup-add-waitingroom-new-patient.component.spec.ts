import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddWaitingroomNewPatientComponent } from './popup-add-waitingroom-new-patient.component';

describe('PopupAddWaitingroomNewPatientComponent', () => {
  let component: PopupAddWaitingroomNewPatientComponent;
  let fixture: ComponentFixture<PopupAddWaitingroomNewPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddWaitingroomNewPatientComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddWaitingroomNewPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
