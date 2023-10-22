import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddFacilityComponent } from './popup-add-facility.component';

describe('PopupAddFacilityComponent', () => {
  let component: PopupAddFacilityComponent;
  let fixture: ComponentFixture<PopupAddFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddFacilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
