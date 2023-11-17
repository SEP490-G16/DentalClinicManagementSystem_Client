import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteMaterialComponent } from './popup-delete-material.component';

describe('PopupDeleteMaterialComponent', () => {
  let component: PopupDeleteMaterialComponent;
  let fixture: ComponentFixture<PopupDeleteMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
