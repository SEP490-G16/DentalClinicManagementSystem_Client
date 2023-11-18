import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddBillImportMaterialComponent } from './popup-add-bill-import-material.component';

describe('PopupAddBillImportMaterialComponent', () => {
  let component: PopupAddBillImportMaterialComponent;
  let fixture: ComponentFixture<PopupAddBillImportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddBillImportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddBillImportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
