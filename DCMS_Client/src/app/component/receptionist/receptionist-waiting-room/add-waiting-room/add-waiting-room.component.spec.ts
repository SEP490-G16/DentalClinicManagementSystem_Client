import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddWaitingRoomComponent } from './add-waiting-room.component';

describe('AddWaitingRoomComponent', () => {
  let component: AddWaitingRoomComponent;
  let fixture: ComponentFixture<AddWaitingRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddWaitingRoomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddWaitingRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
