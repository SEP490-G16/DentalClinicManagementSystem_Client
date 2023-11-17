import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupSualichtaikhamComponent } from './popup-sualichtaikham.component';

describe('PopupSualichtaikhamComponent', () => {
  let component: PopupSualichtaikhamComponent;
  let fixture: ComponentFixture<PopupSualichtaikhamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopupSualichtaikhamComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopupSualichtaikhamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
