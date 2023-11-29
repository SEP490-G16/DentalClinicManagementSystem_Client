import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelSuccessComponent } from './cancel-success.component';

describe('CancelSuccessComponent', () => {
  let component: CancelSuccessComponent;
  let fixture: ComponentFixture<CancelSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelSuccessComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CancelSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
