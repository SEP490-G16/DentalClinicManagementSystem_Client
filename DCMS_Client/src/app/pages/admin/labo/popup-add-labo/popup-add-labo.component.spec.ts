import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddLaboComponent } from './popup-add-labo.component';

describe('PopupAddLaboComponent', () => {
  let component: PopupAddLaboComponent;
  let fixture: ComponentFixture<PopupAddLaboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddLaboComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddLaboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
