import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddMaterialComponent } from './popup-add-material.component';

describe('PopupAddMaterialComponent', () => {
  let component: PopupAddMaterialComponent;
  let fixture: ComponentFixture<PopupAddMaterialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddMaterialComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddMaterialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
