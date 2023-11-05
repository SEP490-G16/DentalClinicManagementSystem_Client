import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterWorkScheduleComponent } from './register-work-schedule.component';

describe('RegisterWorkScheduleComponent', () => {
  let component: RegisterWorkScheduleComponent;
  let fixture: ComponentFixture<RegisterWorkScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegisterWorkScheduleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterWorkScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
