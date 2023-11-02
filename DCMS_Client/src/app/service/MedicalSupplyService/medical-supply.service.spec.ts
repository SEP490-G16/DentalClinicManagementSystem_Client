import { TestBed } from '@angular/core/testing';

import { MedicalSupplyService } from './medical-supply.service';

describe('MedicalSupplyService', () => {
  let service: MedicalSupplyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedicalSupplyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
