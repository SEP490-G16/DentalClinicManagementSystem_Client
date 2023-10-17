import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteServiceComponent } from './popup-delete-service.component';

describe('PopupDeleteServiceComponent', () => {
  let component: PopupDeleteServiceComponent;
  let fixture: ComponentFixture<PopupDeleteServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
