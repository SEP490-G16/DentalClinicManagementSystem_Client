import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteBillImportMaterialComponent } from './popup-delete-bill-import-material.component';

describe('PopupDeleteBillImportMaterialComponent', () => {
  let component: PopupDeleteBillImportMaterialComponent;
  let fixture: ComponentFixture<PopupDeleteBillImportMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteBillImportMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteBillImportMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
