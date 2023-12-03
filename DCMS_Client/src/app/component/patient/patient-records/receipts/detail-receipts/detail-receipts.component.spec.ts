import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailReceiptsComponent } from './detail-receipts.component';

describe('DetailReceiptsComponent', () => {
  let component: DetailReceiptsComponent;
  let fixture: ComponentFixture<DetailReceiptsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DetailReceiptsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailReceiptsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
