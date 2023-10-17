import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteGroupServiceComponent } from './popup-delete-group-service.component';

describe('PopupDeleteGroupServiceComponent', () => {
  let component: PopupDeleteGroupServiceComponent;
  let fixture: ComponentFixture<PopupDeleteGroupServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteGroupServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteGroupServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
