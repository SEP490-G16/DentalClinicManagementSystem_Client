import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditRevenueComponent } from './popup-edit-revenue.component';

describe('PopupEditRevenueComponent', () => {
  let component: PopupEditRevenueComponent;
  let fixture: ComponentFixture<PopupEditRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditRevenueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
