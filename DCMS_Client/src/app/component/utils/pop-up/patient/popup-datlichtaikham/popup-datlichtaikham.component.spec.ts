import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupDatlichtaikhamComponent } from './popup-datlichtaikham.component';

describe('PopupDatlichtaikhamComponent', () => {
  let component: PopupDatlichtaikhamComponent;
  let fixture: ComponentFixture<PopupDatlichtaikhamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupDatlichtaikhamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupDatlichtaikhamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
