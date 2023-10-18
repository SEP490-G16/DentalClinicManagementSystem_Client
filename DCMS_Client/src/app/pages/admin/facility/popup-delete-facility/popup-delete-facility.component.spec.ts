import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteFacilityComponent } from './popup-delete-facility.component';

describe('PopupDeleteFacilityComponent', () => {
  let component: PopupDeleteFacilityComponent;
  let fixture: ComponentFixture<PopupDeleteFacilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteFacilityComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
