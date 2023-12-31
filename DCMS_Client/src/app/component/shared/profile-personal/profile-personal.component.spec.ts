import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilePersonalComponent } from './profile-personal.component';

describe('ProfilePersonalComponent', () => {
  let component: ProfilePersonalComponent;
  let fixture: ComponentFixture<ProfilePersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProfilePersonalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilePersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
