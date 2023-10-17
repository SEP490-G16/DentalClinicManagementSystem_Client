import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddStaffComponent } from './popup-add-staff.component';

describe('PopupAddStaffComponent', () => {
  let component: PopupAddStaffComponent;
  let fixture: ComponentFixture<PopupAddStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddStaffComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
