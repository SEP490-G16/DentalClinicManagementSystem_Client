import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingMaterialComponent } from './pending-material.component';

describe('PendingMaterialComponent', () => {
  let component: PendingMaterialComponent;
  let fixture: ComponentFixture<PendingMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
