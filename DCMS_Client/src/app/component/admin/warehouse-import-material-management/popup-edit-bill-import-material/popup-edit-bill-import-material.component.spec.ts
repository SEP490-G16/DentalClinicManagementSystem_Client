import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditBillImportMaterialComponent } from './popup-edit-bill-import-material.component';

describe('PopupEditBillImportMaterialComponent', () => {
  let component: PopupEditBillImportMaterialComponent;
  let fixture: ComponentFixture<PopupEditBillImportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditBillImportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditBillImportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
