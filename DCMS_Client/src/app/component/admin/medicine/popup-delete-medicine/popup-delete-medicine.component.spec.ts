import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteMedicineComponent } from './popup-delete-medicine.component';

describe('PopupDeleteMedicineComponent', () => {
  let component: PopupDeleteMedicineComponent;
  let fixture: ComponentFixture<PopupDeleteMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteMedicineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
