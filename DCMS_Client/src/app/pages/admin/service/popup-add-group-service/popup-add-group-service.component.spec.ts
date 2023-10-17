import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddGroupServiceComponent } from './popup-add-group-service.component';

describe('PopupAddGroupServiceComponent', () => {
  let component: PopupAddGroupServiceComponent;
  let fixture: ComponentFixture<PopupAddGroupServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddGroupServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddGroupServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
