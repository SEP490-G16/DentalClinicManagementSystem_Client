import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddSpecimensComponent } from './popup-add-specimens.component';

describe('PopupAddSpecimensComponent', () => {
  let component: PopupAddSpecimensComponent;
  let fixture: ComponentFixture<PopupAddSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
