import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteStaffComponent } from './popup-delete-staff.component';

describe('PopupDeleteStaffComponent', () => {
  let component: PopupDeleteStaffComponent;
  let fixture: ComponentFixture<PopupDeleteStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteStaffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
