import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddApproveSpecimensComponent } from './popup-add-approve-specimens.component';

describe('PopupAddApproveSpecimensComponent', () => {
  let component: PopupAddApproveSpecimensComponent;
  let fixture: ComponentFixture<PopupAddApproveSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddApproveSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddApproveSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
