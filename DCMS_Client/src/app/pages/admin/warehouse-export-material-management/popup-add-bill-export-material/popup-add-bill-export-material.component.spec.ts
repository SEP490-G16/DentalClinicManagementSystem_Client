import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddBillExportMaterialComponent } from './popup-add-bill-export-material.component';

describe('PopupAddBillExportMaterialComponent', () => {
  let component: PopupAddBillExportMaterialComponent;
  let fixture: ComponentFixture<PopupAddBillExportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddBillExportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddBillExportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
