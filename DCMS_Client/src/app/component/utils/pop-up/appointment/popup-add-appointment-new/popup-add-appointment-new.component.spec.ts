import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddAppointmentNewComponent } from './popup-add-appointment-new.component';

describe('PopupAddAppointmentNewComponent', () => {
  let component: PopupAddAppointmentNewComponent;
  let fixture: ComponentFixture<PopupAddAppointmentNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddAppointmentNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddAppointmentNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
