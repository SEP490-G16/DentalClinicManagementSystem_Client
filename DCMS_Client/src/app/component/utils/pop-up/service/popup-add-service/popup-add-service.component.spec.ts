import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddServiceComponent } from './popup-add-service.component';

describe('PopupAddServiceComponent', () => {
  let component: PopupAddServiceComponent;
  let fixture: ComponentFixture<PopupAddServiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddServiceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
