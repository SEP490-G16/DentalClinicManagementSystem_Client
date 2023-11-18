import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupConfirmServiceComponent } from './popup-confirm-service.component';

describe('PopupConfirmServiceComponent', () => {
  let component: PopupConfirmServiceComponent;
  let fixture: ComponentFixture<PopupConfirmServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupConfirmServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupConfirmServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
