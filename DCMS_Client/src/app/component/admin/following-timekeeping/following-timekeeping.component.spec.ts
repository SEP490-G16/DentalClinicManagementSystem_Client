import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowingTimekeepingComponent } from './following-timekeeping.component';

describe('FollowingTimekeepingComponent', () => {
  let component: FollowingTimekeepingComponent;
  let fixture: ComponentFixture<FollowingTimekeepingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FollowingTimekeepingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FollowingTimekeepingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
