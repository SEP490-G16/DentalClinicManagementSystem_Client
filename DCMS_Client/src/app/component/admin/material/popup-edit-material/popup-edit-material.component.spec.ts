import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditMaterialComponent } from './popup-edit-material.component';

describe('PopupEditMaterialComponent', () => {
  let component: PopupEditMaterialComponent;
  let fixture: ComponentFixture<PopupEditMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
