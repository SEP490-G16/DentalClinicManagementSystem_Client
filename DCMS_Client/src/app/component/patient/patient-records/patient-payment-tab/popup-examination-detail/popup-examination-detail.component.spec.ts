import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupExaminationDetailComponent } from './PopupExaminationDetailComponent';

describe('PopupExaminationDetailComponent', () => {
  let component: PopupExaminationDetailComponent;
  let fixture: ComponentFixture<PopupExaminationDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupExaminationDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupExaminationDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
