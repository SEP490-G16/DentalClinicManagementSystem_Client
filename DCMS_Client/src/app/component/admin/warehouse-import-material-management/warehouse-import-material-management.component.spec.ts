import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseImportMaterialManagementComponent } from './warehouse-import-material-management.component';

describe('WarehouseImportMaterialManagementComponent', () => {
  let component: WarehouseImportMaterialManagementComponent;
  let fixture: ComponentFixture<WarehouseImportMaterialManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseImportMaterialManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseImportMaterialManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
