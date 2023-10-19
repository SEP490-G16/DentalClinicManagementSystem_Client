import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDetailBillExportMaterialComponent } from './popup-detail-bill-export-material.component';

describe('PopupDetailBillExportMaterialComponent', () => {
  let component: PopupDetailBillExportMaterialComponent;
  let fixture: ComponentFixture<PopupDetailBillExportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDetailBillExportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDetailBillExportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
