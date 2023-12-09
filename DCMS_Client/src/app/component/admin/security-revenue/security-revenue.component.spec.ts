import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SecurityRevenueComponent } from './security-revenue.component';

describe('SecurityRevenueComponent', () => {
  let component: SecurityRevenueComponent;
  let fixture: ComponentFixture<SecurityRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SecurityRevenueComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SecurityRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
