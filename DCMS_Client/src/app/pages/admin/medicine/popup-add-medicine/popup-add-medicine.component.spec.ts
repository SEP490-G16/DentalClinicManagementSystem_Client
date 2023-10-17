import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddMedicineComponent } from './popup-add-medicine.component';

describe('PopupAddMedicineComponent', () => {
  let component: PopupAddMedicineComponent;
  let fixture: ComponentFixture<PopupAddMedicineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddMedicineComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddMedicineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
