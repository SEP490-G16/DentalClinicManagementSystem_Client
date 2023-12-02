import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupGenMedicalPdfComponent } from './popup-gen-medical-pdf.component';

describe('PopupGenMedicalPdfComponent', () => {
  let component: PopupGenMedicalPdfComponent;
  let fixture: ComponentFixture<PopupGenMedicalPdfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupGenMedicalPdfComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupGenMedicalPdfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
