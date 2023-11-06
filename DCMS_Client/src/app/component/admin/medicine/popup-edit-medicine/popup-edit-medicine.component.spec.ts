import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditMedicineComponent } from './popup-edit-medicine.component';

describe('PopupEditMedicineComponent', () => {
  let component: PopupEditMedicineComponent;
  let fixture: ComponentFixture<PopupEditMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditMedicineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
