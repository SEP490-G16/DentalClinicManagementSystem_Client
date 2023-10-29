import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPaymentTabComponent } from './patient-payment-tab.component';

describe('PatientPaymentTabComponent', () => {
  let component: PatientPaymentTabComponent;
  let fixture: ComponentFixture<PatientPaymentTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientPaymentTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPaymentTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
