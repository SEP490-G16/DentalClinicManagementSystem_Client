import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDetailBillImportMaterialComponent } from './popup-detail-bill-import-material.component';

describe('PopupDetailBillImportMaterialComponent', () => {
  let component: PopupDetailBillImportMaterialComponent;
  let fixture: ComponentFixture<PopupDetailBillImportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDetailBillImportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDetailBillImportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
