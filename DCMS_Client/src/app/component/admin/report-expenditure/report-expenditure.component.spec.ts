import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportExpenditureComponent } from './report-expenditure.component';

describe('ReportExpenditureComponent', () => {
  let component: ReportExpenditureComponent;
  let fixture: ComponentFixture<ReportExpenditureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportExpenditureComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportExpenditureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
