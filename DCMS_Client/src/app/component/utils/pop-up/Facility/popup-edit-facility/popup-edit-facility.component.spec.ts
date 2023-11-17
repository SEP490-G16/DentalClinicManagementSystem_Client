import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditFacilityComponent } from './popup-edit-facility.component';

describe('PopupEditFacilityComponent', () => {
  let component: PopupEditFacilityComponent;
  let fixture: ComponentFixture<PopupEditFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditFacilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
