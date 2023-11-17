import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupEditSpecimensComponent } from './popup-edit-specimens.component';

describe('PopupEditSpecimensComponent', () => {
  let component: PopupEditSpecimensComponent;
  let fixture: ComponentFixture<PopupEditSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupEditSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupEditSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
