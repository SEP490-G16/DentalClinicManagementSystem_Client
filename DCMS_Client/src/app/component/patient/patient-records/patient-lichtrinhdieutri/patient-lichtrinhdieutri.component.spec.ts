import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientLichtrinhdieutriComponent } from './patient-lichtrinhdieutri.component';

describe('PatientLichtrinhdieutriComponent', () => {
  let component: PatientLichtrinhdieutriComponent;
  let fixture: ComponentFixture<PatientLichtrinhdieutriComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PatientLichtrinhdieutriComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientLichtrinhdieutriComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
