import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteLaboComponent } from './popup-delete-labo.component';

describe('PopupDeleteLaboComponent', () => {
  let component: PopupDeleteLaboComponent;
  let fixture: ComponentFixture<PopupDeleteLaboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteLaboComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteLaboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
