import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceptionistWaitingRoomComponent } from './receptionist-waiting-room.component';

describe('ReceptionistWaitingRoomComponent', () => {
  let component: ReceptionistWaitingRoomComponent;
  let fixture: ComponentFixture<ReceptionistWaitingRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceptionistWaitingRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReceptionistWaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
