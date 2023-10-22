import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingSpecimensComponent } from './pending-specimens.component';

describe('PendingSpecimensComponent', () => {
  let component: PendingSpecimensComponent;
  let fixture: ComponentFixture<PendingSpecimensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PendingSpecimensComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingSpecimensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
