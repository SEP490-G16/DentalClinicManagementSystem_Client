import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientProfileTabComponent } from './patient-profile-tab.component';

describe('PatientProfileTabComponent', () => {
  let component: PatientProfileTabComponent;
  let fixture: ComponentFixture<PatientProfileTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientProfileTabComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientProfileTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
