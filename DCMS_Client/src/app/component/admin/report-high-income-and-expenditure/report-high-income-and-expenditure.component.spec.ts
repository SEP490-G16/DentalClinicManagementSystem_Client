import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportHighIncomeAndExpenditureComponent } from './report-high-income-and-expenditure.component';

describe('ReportHighIncomeAndExpenditureComponent', () => {
  let component: ReportHighIncomeAndExpenditureComponent;
  let fixture: ComponentFixture<ReportHighIncomeAndExpenditureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportHighIncomeAndExpenditureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportHighIncomeAndExpenditureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
