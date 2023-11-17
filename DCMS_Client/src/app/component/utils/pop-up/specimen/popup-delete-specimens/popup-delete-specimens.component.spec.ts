import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDeleteSpecimensComponent } from './popup-delete-specimens.component';

describe('PopupDeleteSpecimensComponent', () => {
  let component: PopupDeleteSpecimensComponent;
  let fixture: ComponentFixture<PopupDeleteSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDeleteSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDeleteSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
