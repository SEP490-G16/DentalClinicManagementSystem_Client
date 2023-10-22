import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseExportMaterialManagementComponent } from './warehouse-export-material-management.component';

describe('WarehouseExportMaterialManagementComponent', () => {
  let component: WarehouseExportMaterialManagementComponent;
  let fixture: ComponentFixture<WarehouseExportMaterialManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseExportMaterialManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseExportMaterialManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
