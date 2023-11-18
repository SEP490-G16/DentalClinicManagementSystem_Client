import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupAddReportExpenditureComponent } from './popup-add-report-expenditure.component';

describe('PopupAddReportExpenditureComponent', () => {
  let component: PopupAddReportExpenditureComponent;
  let fixture: ComponentFixture<PopupAddReportExpenditureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupAddReportExpenditureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupAddReportExpenditureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
