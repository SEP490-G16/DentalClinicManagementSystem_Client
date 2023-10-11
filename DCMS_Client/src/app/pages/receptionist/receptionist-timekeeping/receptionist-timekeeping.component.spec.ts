import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistTimekeepingComponent } from './receptionist-timekeeping.component';

describe('ReceptionistTimekeepingComponent', () => {
  let component: ReceptionistTimekeepingComponent;
  let fixture: ComponentFixture<ReceptionistTimekeepingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionistTimekeepingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistTimekeepingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
