import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteBillExportMaterialComponent } from './popup-delete-bill-export-material.component';

describe('PopupDeleteBillExportMaterialComponent', () => {
  let component: PopupDeleteBillExportMaterialComponent;
  let fixture: ComponentFixture<PopupDeleteBillExportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteBillExportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteBillExportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
