import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditMaterialRealComponent } from './popup-edit-material-real.component';

describe('PopupEditMaterialRealComponent', () => {
  let component: PopupEditMaterialRealComponent;
  let fixture: ComponentFixture<PopupEditMaterialRealComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditMaterialRealComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditMaterialRealComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
