import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseImportManagementComponent } from './warehouse-import-management.component';

describe('WarehouseImportManagementComponent', () => {
  let component: WarehouseImportManagementComponent;
  let fixture: ComponentFixture<WarehouseImportManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseImportManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WarehouseImportManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
