import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmWaitingroomComponent } from './confirm-waitingroom.component';

describe('ConfirmWaitingroomComponent', () => {
  let component: ConfirmWaitingroomComponent;
  let fixture: ComponentFixture<ConfirmWaitingroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfirmWaitingroomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfirmWaitingroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
