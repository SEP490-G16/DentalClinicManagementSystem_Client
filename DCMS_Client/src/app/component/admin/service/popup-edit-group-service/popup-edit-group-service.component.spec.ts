import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditGroupServiceComponent } from './popup-edit-group-service.component';

describe('PopupEditGroupServiceComponent', () => {
  let component: PopupEditGroupServiceComponent;
  let fixture: ComponentFixture<PopupEditGroupServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditGroupServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditGroupServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
