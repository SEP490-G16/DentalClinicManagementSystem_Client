import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditStaffComponent } from './popup-edit-staff.component';

describe('PopupEditStaffComponent', () => {
  let component: PopupEditStaffComponent;
  let fixture: ComponentFixture<PopupEditStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditStaffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
