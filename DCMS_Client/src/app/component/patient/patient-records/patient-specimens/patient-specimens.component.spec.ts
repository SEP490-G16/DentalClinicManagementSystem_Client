import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientSpecimensComponent } from './patient-specimens.component';

describe('PatientSpecimensComponent', () => {
  let component: PatientSpecimensComponent;
  let fixture: ComponentFixture<PatientSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
