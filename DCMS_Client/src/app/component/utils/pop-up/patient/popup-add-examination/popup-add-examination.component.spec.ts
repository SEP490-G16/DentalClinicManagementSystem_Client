import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddExaminationComponent } from './popup-add-examination.component';

describe('PopupAddExaminationComponent', () => {
  let component: PopupAddExaminationComponent;
  let fixture: ComponentFixture<PopupAddExaminationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddExaminationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddExaminationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
