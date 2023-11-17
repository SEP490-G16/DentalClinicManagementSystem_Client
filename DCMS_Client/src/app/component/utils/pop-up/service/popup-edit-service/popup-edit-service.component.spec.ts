import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditServiceComponent } from './popup-edit-service.component';

describe('PopupEditServiceComponent', () => {
  let component: PopupEditServiceComponent;
  let fixture: ComponentFixture<PopupEditServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
