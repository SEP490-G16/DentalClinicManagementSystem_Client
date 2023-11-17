import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditApproveSpecimensComponent } from './popup-edit-approve-specimens.component';

describe('PopupEditApproveSpecimensComponent', () => {
  let component: PopupEditApproveSpecimensComponent;
  let fixture: ComponentFixture<PopupEditApproveSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditApproveSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditApproveSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
